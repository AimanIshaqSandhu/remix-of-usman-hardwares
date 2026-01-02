import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Search, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const Predictions = () => {
  const [predictionMode, setPredictionMode] = useState<"upload" | "select">("upload");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [prediction, setPrediction] = useState<any>(null);

  const samplePatients = Array.from({ length: 10 }, (_, i) => ({
    id: `PATIENT_${String(i + 1).padStart(3, '0')}`,
    name: `Patient ${i + 1}`,
  }));

  const handlePredict = () => {
    // Simulate prediction
    toast.success("Running prediction...");
    
    setTimeout(() => {
      setPrediction({
        result: "Malignant",
        confidence: 0.87,
        stage: "Stage II",
        stageConfidence: 0.72,
        riskFactors: {
          smoking: { value: "High", confidence: 0.91 },
          alcohol: { value: "Moderate", confidence: 0.68 },
          familyHistory: { value: "Present", confidence: 0.95 },
        }
      });
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Predictions</h1>
        <p className="text-muted-foreground">
          Upload new data or select existing patients to generate predictions
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Data</CardTitle>
            <CardDescription>Choose how to provide data for prediction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Button
                variant={predictionMode === "upload" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setPredictionMode("upload")}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New
              </Button>
              <Button
                variant={predictionMode === "select" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setPredictionMode("select")}
              >
                <Search className="w-4 h-4 mr-2" />
                Select Patient
              </Button>
            </div>

            {predictionMode === "upload" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload Whole Slide Image</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      SVS, TIFF, or PNG (max 2GB)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Or Upload Clinical Data (Optional)</Label>
                  <Input type="file" accept=".csv,.txt,.tsv" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Patient ID</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {samplePatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPatient && (
                  <div className="p-4 rounded-lg bg-secondary/50 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available Data</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Clinical</Badge>
                      <Badge variant="outline">Mutations</Badge>
                      <Badge variant="outline">Transcriptomics</Badge>
                      <Badge variant="outline">2 WSI Images</Badge>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button 
              size="lg" 
              className="w-full"
              onClick={handlePredict}
              disabled={predictionMode === "select" && !selectedPatient}
            >
              Generate Prediction
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
            <CardDescription>AI-powered cancer analysis and insights</CardDescription>
          </CardHeader>
          <CardContent>
            {!prediction ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  No predictions yet. Upload data or select a patient to begin.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Primary Classification */}
                <div>
                  <Label className="text-muted-foreground mb-2 block">Primary Classification</Label>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-6 h-6 text-destructive" />
                      <div>
                        <p className="font-bold text-lg">{prediction.result}</p>
                        <p className="text-sm text-muted-foreground">Cancer detected</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{(prediction.confidence * 100).toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                    </div>
                  </div>
                </div>

                {/* Stage Classification */}
                <div>
                  <Label className="text-muted-foreground mb-2 block">Stage Classification</Label>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-warning/10 border border-warning/20">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-6 h-6 text-warning" />
                      <div>
                        <p className="font-bold text-lg">{prediction.stage}</p>
                        <p className="text-sm text-muted-foreground">Cancer stage</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{(prediction.stageConfidence * 100).toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Confidence</p>
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                <div>
                  <Label className="text-muted-foreground mb-2 block">Risk Factors</Label>
                  <div className="space-y-3">
                    {Object.entries(prediction.riskFactors).map(([key, data]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className="text-sm text-muted-foreground">{data.value}</p>
                        </div>
                        <Badge variant="outline">
                          {(data.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm mb-1">Clinical Recommendation</p>
                      <p className="text-sm text-muted-foreground">
                        Immediate referral to oncology recommended. Consider additional imaging 
                        and biopsy for treatment planning. Monitor closely for disease progression.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Predictions;
