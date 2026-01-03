import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, User, Users, GitMerge, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { customerApi } from "@/services/customerApi";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type?: string;
  totalPurchases?: number;
  currentBalance?: number;
}

const DuplicatesTab = () => {
  const { toast } = useToast();
  const [duplicateType, setDuplicateType] = useState<"phone" | "name">("phone");
  const [phoneDuplicates, setPhoneDuplicates] = useState<Customer[]>([]);
  const [nameDuplicates, setNameDuplicates] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<number>>(new Set());
  const [keptCustomerId, setKeptCustomerId] = useState<number | null>(null);

  // Fetch duplicates based on type
  const fetchDuplicates = async (type: "phone" | "name") => {
    try {
      setLoading(true);
      const response = type === "phone" 
        ? await customerApi.getDuplicatesByPhone()
        : await customerApi.getDuplicatesByName();
      
      if (response.success) {
        if (type === "phone") {
          setPhoneDuplicates(response.data || []);
        } else {
          setNameDuplicates(response.data || []);
        }
      } else {
        toast({
          title: "Error",
          description: `Failed to fetch ${type} duplicates`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`Failed to fetch ${type} duplicates:`, error);
      toast({
        title: "Error",
        description: `Failed to fetch ${type} duplicates`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates(duplicateType);
  }, [duplicateType]);

  // Group duplicates by phone or name
  const groupDuplicates = (customers: Customer[], key: "phone" | "name") => {
    const groups: Record<string, Customer[]> = {};
    customers.forEach(customer => {
      const value = key === "phone" ? customer.phone : customer.name;
      if (value) {
        const normalizedKey = value.toLowerCase().trim();
        if (!groups[normalizedKey]) {
          groups[normalizedKey] = [];
        }
        groups[normalizedKey].push(customer);
      }
    });
    // Filter only groups with more than 1 customer
    return Object.entries(groups).filter(([_, customers]) => customers.length > 1);
  };

  const currentDuplicates = duplicateType === "phone" ? phoneDuplicates : nameDuplicates;
  const groupedDuplicates = groupDuplicates(currentDuplicates, duplicateType);

  // Handle customer selection for merge
  const handleSelectCustomer = (customerId: number, checked: boolean) => {
    const newSelected = new Set(selectedCustomers);
    if (checked) {
      newSelected.add(customerId);
    } else {
      newSelected.delete(customerId);
      if (keptCustomerId === customerId) {
        setKeptCustomerId(null);
      }
    }
    setSelectedCustomers(newSelected);
  };

  // Handle setting the customer to keep
  const handleSetKeptCustomer = (customerId: number) => {
    setKeptCustomerId(customerId);
    // Make sure the kept customer is selected
    const newSelected = new Set(selectedCustomers);
    newSelected.add(customerId);
    setSelectedCustomers(newSelected);
  };

  // Handle merge
  const handleMerge = async () => {
    if (!keptCustomerId || selectedCustomers.size < 2) {
      toast({
        title: "Invalid Selection",
        description: "Please select at least 2 customers and choose which one to keep",
        variant: "destructive"
      });
      return;
    }

    const mergedIds = Array.from(selectedCustomers).filter(id => id !== keptCustomerId);

    try {
      setMerging(true);
      const response = await customerApi.mergeCustomers(keptCustomerId, mergedIds);
      
      if (response.success) {
        toast({
          title: "Customers Merged",
          description: `Successfully merged ${mergedIds.length} customer(s) into the kept customer.`
        });
        // Reset selection and refresh
        setSelectedCustomers(new Set());
        setKeptCustomerId(null);
        fetchDuplicates(duplicateType);
      } else {
        toast({
          title: "Merge Failed",
          description: "Failed to merge customers",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Failed to merge customers:", error);
      toast({
        title: "Error",
        description: "Failed to merge customers",
        variant: "destructive"
      });
    } finally {
      setMerging(false);
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedCustomers(new Set());
    setKeptCustomerId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Duplicate Customers
              </h3>
              <p className="text-sm text-muted-foreground">
                Find and merge customers with duplicate phone numbers or names
              </p>
            </div>
            {selectedCustomers.size > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleClearSelection}>
                  Clear Selection ({selectedCustomers.size})
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleMerge}
                  disabled={merging || !keptCustomerId || selectedCustomers.size < 2}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {merging ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Merging...
                    </>
                  ) : (
                    <>
                      <GitMerge className="h-4 w-4 mr-2" />
                      Merge Selected
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for duplicate type */}
      <Tabs value={duplicateType} onValueChange={(v) => setDuplicateType(v as "phone" | "name")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            By Phone
          </TabsTrigger>
          <TabsTrigger value="name" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            By Name
          </TabsTrigger>
        </TabsList>

        <TabsContent value="phone" className="mt-4">
          <DuplicatesList
            groups={groupedDuplicates}
            loading={loading}
            selectedCustomers={selectedCustomers}
            keptCustomerId={keptCustomerId}
            onSelectCustomer={handleSelectCustomer}
            onSetKeptCustomer={handleSetKeptCustomer}
            duplicateKey="phone"
          />
        </TabsContent>

        <TabsContent value="name" className="mt-4">
          <DuplicatesList
            groups={groupedDuplicates}
            loading={loading}
            selectedCustomers={selectedCustomers}
            keptCustomerId={keptCustomerId}
            onSelectCustomer={handleSelectCustomer}
            onSetKeptCustomer={handleSetKeptCustomer}
            duplicateKey="name"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Component to display grouped duplicates
const DuplicatesList = ({
  groups,
  loading,
  selectedCustomers,
  keptCustomerId,
  onSelectCustomer,
  onSetKeptCustomer,
  duplicateKey
}: {
  groups: [string, Customer[]][];
  loading: boolean;
  selectedCustomers: Set<number>;
  keptCustomerId: number | null;
  onSelectCustomer: (id: number, checked: boolean) => void;
  onSetKeptCustomer: (id: number) => void;
  duplicateKey: "phone" | "name";
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading duplicates...</p>
        </CardContent>
      </Card>
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">No Duplicates Found</p>
          <p className="text-sm text-muted-foreground">
            All customers have unique {duplicateKey === "phone" ? "phone numbers" : "names"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(([key, customers]) => (
        <Card key={key} className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {duplicateKey === "phone" ? (
                <Phone className="h-4 w-4 text-orange-500" />
              ) : (
                <User className="h-4 w-4 text-orange-500" />
              )}
              <span className="text-orange-600">{key}</span>
              <Badge variant="outline" className="ml-auto">
                {customers.length} duplicates
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {customers.map((customer) => {
                const isSelected = selectedCustomers.has(customer.id);
                const isKept = keptCustomerId === customer.id;

                return (
                  <div
                    key={customer.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      isKept 
                        ? "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700" 
                        : isSelected 
                          ? "bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700"
                          : "bg-muted/30 border-border"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => onSelectCustomer(customer.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">{customer.name}</span>
                        {customer.type && (
                          <Badge variant="secondary" className="text-xs">
                            {customer.type}
                          </Badge>
                        )}
                        {isKept && (
                          <Badge className="bg-green-500 text-white text-xs">
                            Will Keep
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        <span>
                          <Phone className="h-3 w-3 inline mr-1" />
                          {customer.phone || "N/A"}
                        </span>
                        {customer.email && (
                          <span className="truncate max-w-[200px]">{customer.email}</span>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm mt-2">
                        <span className="text-green-600">
                          Purchases: PKR {(customer.totalPurchases || 0).toLocaleString()}
                        </span>
                        {(customer.currentBalance || 0) > 0 && (
                          <span className="text-red-600">
                            Due: PKR {customer.currentBalance?.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant={isKept ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSetKeptCustomer(customer.id)}
                      className={isKept ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {isKept ? "Keeping" : "Keep This"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DuplicatesTab;

