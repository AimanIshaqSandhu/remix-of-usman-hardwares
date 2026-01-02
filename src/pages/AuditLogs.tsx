import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter, Clock, Database, User, ChevronDown, ChevronUp, FileText, Plus, Edit, Trash2, RefreshCw, Activity, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiConfig } from "@/utils/apiConfig";
import { format } from "date-fns";

interface AuditLog {
  id: number;
  tableName: string;
  recordId: number;
  action: "INSERT" | "UPDATE" | "DELETE";
  userId: number | null;
  userLogin: string;
  oldData: Record<string, any> | null;
  newData: Record<string, any> | null;
  changedFields: string[] | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface AuditLogsResponse {
  success: boolean;
  data: {
    logs: AuditLog[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  weekLogs: number;
  monthLogs: number;
  byAction: { INSERT: number; UPDATE: number; DELETE: number };
  byTable: Record<string, number>;
  recentActivity: { date: string; count: number }[];
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "INSERT":
      return <Plus className="h-4 w-4" />;
    case "UPDATE":
      return <Edit className="h-4 w-4" />;
    case "DELETE":
      return <Trash2 className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case "INSERT":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "UPDATE":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "DELETE":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const formatTableName = (tableName: string) => {
  return tableName
    .replace("uh_ims_", "")
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const AuditLogCard = ({ log }: { log: AuditLog }) => {
  const [expanded, setExpanded] = useState(false);

  const renderDataDiff = () => {
    if (!log.oldData && !log.newData) return null;

    const allKeys = new Set([
      ...Object.keys(log.oldData || {}),
      ...Object.keys(log.newData || {})
    ]);

    return (
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {log.oldData && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Previous State</p>
              <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 space-y-1.5">
                {Array.from(allKeys).map(key => {
                  const isChanged = log.changedFields?.includes(key);
                  const value = log.oldData?.[key];
                  if (value === undefined) return null;
                  return (
                    <div key={key} className={`flex justify-between text-sm ${isChanged ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}`}>
                      <span className="font-mono text-xs">{key}:</span>
                      <span className="font-mono text-xs truncate max-w-[200px]">{JSON.stringify(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {log.newData && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New State</p>
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 space-y-1.5">
                {Array.from(allKeys).map(key => {
                  const isChanged = log.changedFields?.includes(key);
                  const value = log.newData?.[key];
                  if (value === undefined) return null;
                  return (
                    <div key={key} className={`flex justify-between text-sm ${isChanged ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                      <span className="font-mono text-xs">{key}:</span>
                      <span className="font-mono text-xs truncate max-w-[200px]">{JSON.stringify(value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {log.changedFields && log.changedFields.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Modified fields:</span>{" "}
              {log.changedFields.map((field, i) => (
                <Badge key={field} variant="outline" className="ml-1 text-xs font-mono">
                  {field}
                </Badge>
              ))}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg border ${getActionColor(log.action)}`}>
              {getActionIcon(log.action)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`${getActionColor(log.action)} border`}>
                  {log.action}
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  {formatTableName(log.tableName)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Record #{log.recordId}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {log.userLogin}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {expanded && renderDataDiff()}
      </CardContent>
    </Card>
  );
};

const AuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // API-based data
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [users, setUsers] = useState<{ userId: number; userLogin: string; count: number }[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiConfig.getBaseUrl()}/audit-logs/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch audit stats:", error);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch(`${apiConfig.getBaseUrl()}/audit-logs/tables`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setTables(data.data);
      } else {
        setTables([]);
      }
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiConfig.getBaseUrl()}/audit-logs/users`);
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchLogs = async (page: number = 1) => {
    setLoading(true);
    try {
      let url = `${apiConfig.getBaseUrl()}/audit-logs?page=${page}&per_page=50`;
      if (actionFilter !== "all") url += `&action=${actionFilter}`;
      if (tableFilter !== "all") url += `&table=${tableFilter}`;
      if (userFilter !== "all") url += `&user_id=${userFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const response = await fetch(url);
      const data: AuditLogsResponse = await response.json();
      if (data.success) {
        setLogs(data.data.logs);
        setTotalPages(data.data.pagination.totalPages);
        setCurrentPage(data.data.pagination.currentPage);
        setTotalItems(data.data.pagination.totalItems);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    setStatsLoading(true);
    await Promise.all([fetchStats(), fetchTables(), fetchUsers()]);
    setStatsLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    fetchLogs();
  }, []);

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter, tableFilter, userFilter]);

  const handleSearch = () => {
    fetchLogs(1);
  };

  const handleRefresh = async () => {
    await fetchAllData();
    await fetchLogs(currentPage);
  };

  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    return logs.filter(log => {
      return log.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userLogin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(log.oldData).toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(log.newData).toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.recordId.toString().includes(searchQuery);
    });
  }, [logs, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
              <p className="text-muted-foreground text-sm">Track all system activities and changes</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalLogs?.toLocaleString() || totalItems}</p>
                      <p className="text-xs text-muted-foreground">Total Logs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-gradient-to-br from-emerald-500/5 to-transparent">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <Calendar className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.todayLogs?.toLocaleString() || 0}</p>
                      <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-gradient-to-br from-amber-500/5 to-transparent">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <TrendingUp className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.weekLogs?.toLocaleString() || 0}</p>
                      <p className="text-xs text-muted-foreground">This Week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-gradient-to-br from-violet-500/5 to-transparent">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                      <Database className="h-5 w-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.monthLogs?.toLocaleString() || 0}</p>
                      <p className="text-xs text-muted-foreground">This Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Action Stats */}
        {stats?.byAction && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Plus className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{stats.byAction.INSERT?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">Inserts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Edit className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{stats.byAction.UPDATE?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">Updates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{stats.byAction.DELETE?.toLocaleString() || 0}</p>
                    <p className="text-xs text-muted-foreground">Deletes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs by table, action, user, or data..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch} variant="secondary">
                  Search
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="INSERT">Insert</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tableFilter} onValueChange={setTableFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Database className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Table" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tables</SelectItem>
                    {tables.map(table => (
                      <SelectItem key={table} value={table}>
                        {formatTableName(table)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-[160px]">
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="User" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.userId || user.userLogin} value={user.userId?.toString() || user.userLogin}>
                        {user.userLogin} ({user.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {totalItems.toLocaleString()} logs
            </p>
          </div>
        )}

        {/* Logs List */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredLogs.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="p-12 text-center">
                <Database className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg mb-1">No logs found</h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery || actionFilter !== "all" || tableFilter !== "all" || userFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No audit logs have been recorded yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map(log => (
              <AuditLogCard key={log.id} log={log} />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || loading}
              onClick={() => fetchLogs(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || loading}
              onClick={() => fetchLogs(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
