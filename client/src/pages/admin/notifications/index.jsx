import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Bell, Send, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function NotificationsPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetAudience: "all",
    deliveryMethod: "dashboard",
  });

  function handleSendNotification(e) {
    e.preventDefault();
    // TODO: Implement API call
    toast({
      title: "Success",
      description: "Notification sent successfully",
    });
    setFormData({
      title: "",
      message: "",
      targetAudience: "all",
      deliveryMethod: "dashboard",
    });
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Send system-wide updates to students and instructors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Send Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <Textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Notification message"
                  rows={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience *
                </label>
                <Select
                  value={formData.targetAudience}
                  onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="students">Students Only</SelectItem>
                    <SelectItem value="instructors">Instructors Only</SelectItem>
                    <SelectItem value="hr">HR/Companies Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Method *
                </label>
                <RadioGroup
                  value={formData.deliveryMethod}
                  onValueChange={(value) => setFormData({ ...formData, deliveryMethod: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dashboard" id="dashboard" />
                    <Label htmlFor="dashboard">Dashboard Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email">Email Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Both Dashboard & Email</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button type="submit" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock notification history */}
              <div className="p-3 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">System Maintenance</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Scheduled maintenance on January 20, 2024
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">To: All Users</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">Dashboard</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">New Course Available</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Check out our new Full Stack Development course
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">To: Students</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">Email & Dashboard</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">5 days ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default NotificationsPage;

