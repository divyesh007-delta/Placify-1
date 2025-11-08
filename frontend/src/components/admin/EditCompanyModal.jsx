import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Trash2 } from "lucide-react";

export default function EditCompanyModal({ open, onClose, company, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    description: "",
    location: "",
    founded: "",
    employees: "",
    website: "",
    tags: [],
    jobRoles: [],
    stats: {
      successRate: 0,
      totalHired: 0,
      avgPackage: 0,
      difficulty: "Medium",
      highestPackage: 0,
      thisYearHires: 0
    }
  });
  const [newTag, setNewTag] = useState("");
  const [newJobRole, setNewJobRole] = useState({
    title: "",
    avgPackage: "",
    positions: "",
    bondInfo: "No bond",
    requirements: []
  });
  const [newRequirement, setNewRequirement] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        logo: company.logo || "",
        description: company.description || "",
        location: company.location || "",
        founded: company.founded || "",
        employees: company.employees || "",
        website: company.website || "",
        tags: company.tags || [],
        jobRoles: company.jobRoles || [],
        stats: company.stats || {
          successRate: 0,
          totalHired: 0,
          avgPackage: 0,
          difficulty: "Medium",
          highestPackage: 0,
          thisYearHires: 0
        }
      });
    }
  }, [company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error updating company:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addJobRole = () => {
    if (newJobRole.title.trim() && newJobRole.avgPackage && newJobRole.positions) {
      setFormData(prev => ({
        ...prev,
        jobRoles: [...prev.jobRoles, {
          ...newJobRole,
          avgPackage: parseInt(newJobRole.avgPackage) || 0,
          positions: parseInt(newJobRole.positions) || 0
        }]
      }));
      setNewJobRole({
        title: "",
        avgPackage: "",
        positions: "",
        bondInfo: "No bond",
        requirements: []
      });
    }
  };

  const removeJobRole = (index) => {
    setFormData(prev => ({
      ...prev,
      jobRoles: prev.jobRoles.filter((_, i) => i !== index)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !newJobRole.requirements.includes(newRequirement.trim())) {
      setNewJobRole(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement("");
    }
  };

  const removeRequirement = (reqToRemove) => {
    setNewJobRole(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== reqToRemove)
    }));
  };

  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'tag') addTag();
      if (type === 'requirement') addRequirement();
    }
  };

  const handleStatsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [field]: field.includes('Package') || field.includes('Rate') || field.includes('Hired') 
          ? parseInt(value) || 0 
          : value
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company - {company?.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Company Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location *</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-logo">Logo URL</Label>
            <Input
              id="edit-logo"
              value={formData.logo}
              onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-founded">Founded Year</Label>
              <Input
                id="edit-founded"
                value={formData.founded}
                onChange={(e) => setFormData(prev => ({ ...prev, founded: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-employees">Employees</Label>
              <Input
                id="edit-employees"
                value={formData.employees}
                onChange={(e) => setFormData(prev => ({ ...prev, employees: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
          </div>

          {/* Company Statistics */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Company Statistics</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="success-rate">Success Rate (%)</Label>
                <Input
                  id="success-rate"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.stats.successRate}
                  onChange={(e) => handleStatsChange("successRate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total-hired">Total Hired</Label>
                <Input
                  id="total-hired"
                  type="number"
                  min="0"
                  value={formData.stats.totalHired}
                  onChange={(e) => handleStatsChange("totalHired", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avg-package">Avg Package (L)</Label>
                <Input
                  id="avg-package"
                  type="number"
                  min="0"
                  value={formData.stats.avgPackage}
                  onChange={(e) => handleStatsChange("avgPackage", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.stats.difficulty}
                  onValueChange={(value) => handleStatsChange("difficulty", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="highest-package">Highest Package (L)</Label>
                <Input
                  id="highest-package"
                  type="number"
                  min="0"
                  value={formData.stats.highestPackage}
                  onChange={(e) => handleStatsChange("highestPackage", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="this-year-hires">This Year Hires</Label>
                <Input
                  id="this-year-hires"
                  type="number"
                  min="0"
                  value={formData.stats.thisYearHires}
                  onChange={(e) => handleStatsChange("thisYearHires", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="edit-tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="edit-tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'tag')}
                placeholder="Add tag (e.g., AI/ML, Cloud)"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Job Roles */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Job Roles</Label>
            
            {/* Add New Job Role */}
            <div className="p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    value={newJobRole.title}
                    onChange={(e) => setNewJobRole(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Software Development Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Avg Package (L) *</Label>
                  <Input
                    type="number"
                    value={newJobRole.avgPackage}
                    onChange={(e) => setNewJobRole(prev => ({ ...prev, avgPackage: e.target.value }))}
                    placeholder="45"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Positions *</Label>
                  <Input
                    type="number"
                    value={newJobRole.positions}
                    onChange={(e) => setNewJobRole(prev => ({ ...prev, positions: e.target.value }))}
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bond Information</Label>
                <Input
                  value={newJobRole.bondInfo}
                  onChange={(e) => setNewJobRole(prev => ({ ...prev, bondInfo: e.target.value }))}
                  placeholder="No bond"
                />
              </div>

              <div className="space-y-2">
                <Label>Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'requirement')}
                    placeholder="Add requirement"
                  />
                  <Button type="button" onClick={addRequirement} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {newJobRole.requirements.map((req) => (
                    <Badge key={req} variant="outline" className="gap-1">
                      {req}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => removeRequirement(req)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <Button type="button" onClick={addJobRole} className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Job Role
              </Button>
            </div>

            {/* Existing Job Roles */}
            <div className="space-y-3">
              {formData.jobRoles.map((role, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{role.title}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeJobRole(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Package:</span>
                      <div className="font-medium">₹{role.avgPackage}L</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Positions:</span>
                      <div className="font-medium">{role.positions}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bond:</span>
                      <div className="font-medium">{role.bondInfo}</div>
                    </div>
                  </div>
                  {role.requirements && role.requirements.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Requirements:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {role.requirements.map((req, reqIndex) => (
                          <Badge key={reqIndex} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}