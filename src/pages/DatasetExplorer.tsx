import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileText, Image as ImageIcon } from "lucide-react";

const DatasetExplorer = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const dataTypes = [
    { name: "clinical", count: 82, description: "Patient clinical information" },
    { name: "exposure", count: 82, description: "Environmental and lifestyle exposure data" },
    { name: "follow_up", count: 82, description: "Patient follow-up records" },
    { name: "methylation", count: 82, description: "DNA methylation profiles" },
    { name: "mutations", count: 82, description: "Genetic mutation data" },
    { name: "pathology_detail", count: 82, description: "Detailed pathology reports" },
    { name: "transcriptomics", count: 82, description: "Gene expression data" },
  ];

  // Sample data for demonstration
  const samplePatients = Array.from({ length: 10 }, (_, i) => ({
    id: `PATIENT_${String(i + 1).padStart(3, '0')}`,
    age: 45 + Math.floor(Math.random() * 30),
    gender: Math.random() > 0.5 ? 'Male' : 'Female',
    stage: ['I', 'II', 'III', 'IV'][Math.floor(Math.random() * 4)],
    status: Math.random() > 0.3 ? 'Complete' : 'Incomplete',
  }));

  const sampleImages = Array.from({ length: 12 }, (_, i) => ({
    id: `WSI_${String(i + 1).padStart(3, '0')}`,
    patient: `PATIENT_${String(Math.floor(Math.random() * 82) + 1).padStart(3, '0')}`,
    format: 'SVS',
    size: `${(Math.random() * 2 + 1).toFixed(2)} GB`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dataset Explorer</h1>
        <p className="text-muted-foreground">
          Browse and explore the NeoHack cancer prediction dataset
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="textual">Textual Data</TabsTrigger>
          <TabsTrigger value="images">Images (WSI)</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle>Textual Data Files</CardTitle>
                </div>
                <CardDescription>7 data types covering 82 patients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {dataTypes.map((type) => (
                  <div key={type.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm">{type.name}.txt</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                    <Badge variant="outline">{type.count} records</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <CardTitle>Whole Slide Images</CardTitle>
                </div>
                <CardDescription>High-resolution pathology imaging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Images</span>
                    <span className="font-bold text-2xl text-primary">172</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Format</span>
                    <Badge>SVS</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Size</span>
                    <span className="font-medium">~1.5 GB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Storage</span>
                    <span className="font-medium">~258 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="textual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>Browse textual data across all 82 patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Data Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {samplePatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-mono text-sm">{patient.id}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Stage {patient.stage}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={patient.status === 'Complete' ? 'default' : 'secondary'}
                            className={patient.status === 'Complete' ? 'bg-success' : ''}
                          >
                            {patient.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Whole Slide Images</CardTitle>
              <CardDescription>172 high-resolution pathology images in SVS format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by image or patient ID..."
                  className="pl-10"
                />
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image ID</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleImages.map((image) => (
                      <TableRow key={image.id}>
                        <TableCell className="font-mono text-sm">{image.id}</TableCell>
                        <TableCell className="font-mono text-sm">{image.patient}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{image.format}</Badge>
                        </TableCell>
                        <TableCell>{image.size}</TableCell>
                        <TableCell>
                          <button className="text-primary hover:text-primary/80 text-sm font-medium">
                            View
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatasetExplorer;
