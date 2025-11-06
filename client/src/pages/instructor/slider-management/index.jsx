import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getAdminSlidersService,
  createSliderService,
  updateSliderService,
  deleteSliderService,
  toggleSliderStatusService,
  mediaUploadService,
  mediaDeleteService,
} from "@/services";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Eye, EyeOff, Plus, Upload, X } from "lucide-react";

function SliderManagement() {
  const { toast } = useToast();
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    badge: "Featured",
    imageUrl: "",
    public_id: "",
    statLeft: "50,000+ students",
    statMid: "4.8 rating",
    statRight: "Self-paced",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await getAdminSlidersService();
      if (response.success) {
        setSliders(response.data);
      }
    } catch (error) {
      console.error("Error fetching sliders:", error);
      toast({ title: "Error", description: "Failed to fetch sliders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image size should be less than 5MB", variant: "destructive" });
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await mediaUploadService(
        uploadFormData,
        setUploadProgress
      );

      if (response.success) {
        setFormData({
          ...formData,
          imageUrl: response.data.url,
          public_id: response.data.public_id,
        });
        toast({ title: "Success", description: "Image uploaded successfully" });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({ title: "Upload failed", description: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = async () => {
    if (formData.public_id) {
      try {
        await mediaDeleteService(formData.public_id);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
    setFormData({ ...formData, imageUrl: "", public_id: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.subtitle || !formData.imageUrl) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      let response;

      if (editingSlider) {
        response = await updateSliderService(editingSlider._id, formData);
      } else {
        response = await createSliderService(formData);
      }

      if (response.success) {
        toast({ 
          title: "Success", 
          description: editingSlider
            ? "Slider updated successfully"
            : "Slider created successfully"
        });
        setDialogOpen(false);
        resetForm();
        fetchSliders();
      }
    } catch (error) {
      console.error("Error saving slider:", error);
      toast({ title: "Error", description: "Failed to save slider", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      subtitle: slider.subtitle,
      badge: slider.badge,
      imageUrl: slider.imageUrl,
      public_id: slider.public_id || "",
      statLeft: slider.statLeft,
      statMid: slider.statMid,
      statRight: slider.statRight,
      order: slider.order,
      isActive: slider.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this slider?")) return;

    try {
      setLoading(true);
      const response = await deleteSliderService(id);
      if (response.success) {
        toast({ title: "Deleted", description: "Slider deleted successfully" });
        fetchSliders();
      }
    } catch (error) {
      console.error("Error deleting slider:", error);
      toast({ title: "Error", description: "Failed to delete slider", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await toggleSliderStatusService(id);
      if (response.success) {
        toast({ title: "Success", description: response.message });
        fetchSliders();
      }
    } catch (error) {
      console.error("Error toggling slider status:", error);
      toast({ title: "Error", description: "Failed to toggle slider status", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      badge: "Featured",
      imageUrl: "",
      public_id: "",
      statLeft: "50,000+ students",
      statMid: "4.8 rating",
      statRight: "Self-paced",
      order: 0,
      isActive: true,
    });
    setEditingSlider(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Slider Management</h1>
        <Button onClick={handleOpenDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Slider
        </Button>
      </div>

      {loading && sliders.length === 0 ? (
        <div className="text-center py-12">Loading sliders...</div>
      ) : sliders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">No sliders found</p>
            <Button onClick={handleOpenDialog}>Create your first slider</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliders.map((slider) => (
            <Card key={slider._id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={slider.imageUrl}
                  alt={slider.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant={slider.isActive ? "default" : "secondary"}
                    onClick={() => handleToggleStatus(slider._id)}
                  >
                    {slider.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{slider.title}</CardTitle>
                <p className="text-sm text-gray-600">{slider.subtitle}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {slider.badge}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      slider.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {slider.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(slider)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(slider._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSlider ? "Edit Slider" : "Add New Slider"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Master Programming Skills"
                required
              />
            </div>

            <div>
              <Label htmlFor="subtitle">
                Subtitle <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                placeholder="Build your coding expertise with hands-on projects..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="badge">Badge</Label>
              <Input
                id="badge"
                value={formData.badge}
                onChange={(e) =>
                  setFormData({ ...formData, badge: e.target.value })
                }
                placeholder="Featured"
              />
            </div>

            <div>
              <Label htmlFor="image">
                Slider Image <span className="text-red-500">*</span>
              </Label>
              {formData.imageUrl ? (
                <div className="relative mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2">
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded cursor-pointer hover:bg-gray-50"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Click to upload image
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      Max size: 5MB
                    </span>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              )}
              {uploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="statLeft">Stat Left</Label>
                <Input
                  id="statLeft"
                  value={formData.statLeft}
                  onChange={(e) =>
                    setFormData({ ...formData, statLeft: e.target.value })
                  }
                  placeholder="50,000+ students"
                />
              </div>
              <div>
                <Label htmlFor="statMid">Stat Middle</Label>
                <Input
                  id="statMid"
                  value={formData.statMid}
                  onChange={(e) =>
                    setFormData({ ...formData, statMid: e.target.value })
                  }
                  placeholder="4.8 rating"
                />
              </div>
              <div>
                <Label htmlFor="statRight">Stat Right</Label>
                <Input
                  id="statRight"
                  value={formData.statRight}
                  onChange={(e) =>
                    setFormData({ ...formData, statRight: e.target.value })
                  }
                  placeholder="Self-paced"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {loading
                  ? "Saving..."
                  : editingSlider
                  ? "Update Slider"
                  : "Create Slider"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SliderManagement;
