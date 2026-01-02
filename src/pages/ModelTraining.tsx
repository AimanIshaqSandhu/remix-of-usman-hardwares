import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Brain, Cpu, Database, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ModelTraining = () => {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [epochs, setEpochs] = useState([50]);
  const [includeImages, setIncludeImages] = useState(false);
  const [includeTextual, setIncludeTextual] = useState(false);

  const models = [
    {
      id: "cnn",
      name: "Convolutional Neural Network",
      icon: Brain,
      description: "Deep learning for image classification",
      dataTypes: ["Images only"],
      bestFor: "High-resolution WSI analysis",
    },
    {
      id: "rf",
      name: "Random Forest",
      icon: Database,
      description: "Ensemble learning for tabular data",
      dataTypes: ["Textual only"],
      bestFor: "Clinical records and gene expression",
    },
    {
      id: "xgboost",
      name: "XGBoost",
      icon: Cpu,
      description: "Gradient boosting for structured data",
      dataTypes: ["Textual only"],
      bestFor: "Feature-rich tabular datasets",
    },
    {
      id: "multimodal",
      name: "Multimodal Fusion",
      icon: Sparkles,
      description: "Combined image and text analysis",
      dataTypes: ["Images + Textual"],
      bestFor: "Maximum prediction accuracy",
    },
  ];

  const tasks = [
    { id: "binary", name: "Cancer vs Non-cancer", description: "Binary classification" },
    { id: "stage", name: "Cancer Stage Prediction", description: "Multi-class classification" },
    { id: "risk", name: "Risk Factor Assessment", description: "Regression/Classification" },
    { id: "custom", name: "Custom Prediction", description: "Your custom task" },
  ];

  const handleStartTraining = () => {
    if (!selectedModel || !selectedTask) {
      toast.error("Please select a model and task");
      return;
    }

    if (selectedModel === "multimodal" && (!includeImages || !includeTextual)) {
      toast.error("Multimodal model requires both image and textual data");
      return;
    }

    if (selectedModel === "cnn" && !includeImages) {
      toast.error("CNN model requires image data");
      return;
    }

    if ((selectedModel === "rf" || selectedModel === "xgboost") && !includeTextual) {
      toast.error("Selected model requires textual data");
      return;
    }

    toast.success("Training started!");
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Model Training</h1>
        <p className="text-muted-foreground">
          Configure and train your cancer prediction model
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Model Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Model Architecture</CardTitle>
              <CardDescription>Choose the best model for your data and task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {models.map((model) => {
                const Icon = model.icon;
                const isSelected = selectedModel === model.id;
                
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-secondary"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{model.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {model.dataTypes.map((type) => (
                            <span key={type} className="text-xs px-2 py-1 rounded bg-secondary">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Prediction Task</CardTitle>
              <CardDescription>What do you want to predict?</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a task..." />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-xs text-muted-foreground">{task.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Selection</CardTitle>
              <CardDescription>Select which data types to include</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="images"
                  checked={includeImages}
                  onCheckedChange={(checked) => setIncludeImages(checked as boolean)}
                />
                <Label htmlFor="images" className="cursor-pointer">
                  Include Whole Slide Images (172 images)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="textual"
                  checked={includeTextual}
                  onCheckedChange={(checked) => setIncludeTextual(checked as boolean)}
                />
                <Label htmlFor="textual" className="cursor-pointer">
                  Include Textual Data (7 data types, 82 patients)
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Training Parameters</CardTitle>
              <CardDescription>Configure model hyperparameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Training Epochs</Label>
                  <span className="text-sm font-medium">{epochs[0]}</span>
                </div>
                <Slider
                  value={epochs}
                  onValueChange={setEpochs}
                  min={10}
                  max={200}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  More epochs = longer training but potentially better results
                </p>
              </div>

              <div className="space-y-2">
                <Label>Batch Size</Label>
                <Select defaultValue="32">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="32">32</SelectItem>
                    <SelectItem value="64">64</SelectItem>
                    <SelectItem value="128">128</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Learning Rate</Label>
                <Select defaultValue="0.001">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.0001">0.0001</SelectItem>
                    <SelectItem value="0.001">0.001</SelectItem>
                    <SelectItem value="0.01">0.01</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleStartTraining}
          >
            Start Training <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModelTraining;
