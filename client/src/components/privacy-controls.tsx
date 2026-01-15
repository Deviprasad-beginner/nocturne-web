import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Shield, Eye, EyeOff, Volume2, VolumeX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PrivacyControlsProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onVideoToggle: () => void;
  onAudioToggle: () => void;
  onReport: (reason: string, details: string) => void;
}

export function PrivacyControls({ 
  isVideoEnabled, 
  isAudioEnabled, 
  onVideoToggle, 
  onAudioToggle, 
  onReport 
}: PrivacyControlsProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  const handleReport = () => {
    if (reportReason && reportDetails.trim()) {
      onReport(reportReason, reportDetails.trim());
      setShowReportModal(false);
      setReportReason("");
      setReportDetails("");
    }
  };

  const reportReasons = [
    { value: "harassment", label: "Harassment or Bullying" },
    { value: "inappropriate_content", label: "Inappropriate Content" },
    { value: "spam", label: "Spam or Unwanted Content" },
    { value: "impersonation", label: "Impersonation" },
    { value: "threats", label: "Threats or Violence" },
    { value: "privacy_violation", label: "Privacy Violation" },
    { value: "underage", label: "Underage User" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="space-y-4">
      {/* Media Controls */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Media Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Camera</span>
              <Badge variant={isVideoEnabled ? "default" : "secondary"}>
                {isVideoEnabled ? "On" : "Off"}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onVideoToggle}
              className="border-gray-600"
            >
              {isVideoEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm">Microphone</span>
              <Badge variant={isAudioEnabled ? "default" : "secondary"}>
                {isAudioEnabled ? "On" : "Off"}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAudioToggle}
              className="border-gray-600"
            >
              {isAudioEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Safety Notice */}
      <Card className="bg-yellow-900/30 border-yellow-700/50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-200 mb-1">Privacy & Safety</h4>
              <p className="text-xs text-yellow-300">
                Your safety is our priority. All conversations are monitored for community guidelines. 
                Report any inappropriate behavior immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Button */}
      <Button
        variant="outline"
        onClick={() => setShowReportModal(true)}
        className="w-full border-red-600 text-red-300 hover:bg-red-700/30"
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        Report User
      </Button>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>Report User</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Reason for Report</label>
                <Select value={reportReason} onValueChange={setReportReason}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Additional Details</label>
                <Textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Please provide specific details about the incident..."
                  rows={4}
                  className="bg-gray-700/50 border-gray-600"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 border-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReport}
                  disabled={!reportReason || !reportDetails.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Submit Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}