import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { profileService } from "@/services/profileService";
import { Upload, Trash2, User, Download } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { WeightChart } from "./WeightChart";
import { CaloriesChart } from "./CaloriesChart";
import { WaterChart } from "./WaterChart";
import { backupService } from "@/services/backupService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Profile = Tables<"profiles">;

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated: () => void;
}

export function ProfileDialog({ open, onOpenChange, onProfileUpdated }: ProfileDialogProps) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exportingBackup, setExportingBackup] = useState(false);
  const [importingBackup, setImportingBackup] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState<File | null>(null);

  // Nutritional goals state
  const [fiberMin, setFiberMin] = useState("25");
  const [fiberMax, setFiberMax] = useState("30");
  const [fiberTarget, setFiberTarget] = useState("27.5");
  const [sugarMin, setSugarMin] = useState("30");
  const [sugarMax, setSugarMax] = useState("50");
  const [sugarTarget, setSugarTarget] = useState("40");
  const [carbsMin, setCarbsMin] = useState("200");
  const [carbsMax, setCarbsMax] = useState("300");
  const [carbsTarget, setCarbsTarget] = useState("250");
  const [fatsMin, setFatsMin] = useState("50");
  const [fatsMax, setFatsMax] = useState("60");
  const [fatsTarget, setFatsTarget] = useState("55");
  const [proteinMin, setProteinMin] = useState("50");
  const [proteinMax, setProteinMax] = useState("100");
  const [proteinTarget, setProteinTarget] = useState("75");
  const [saltMax, setSaltMax] = useState("6");
  const [kcalMin, setKcalMin] = useState("1500");
  const [kcalMax, setKcalMax] = useState("2500");
  const [kcalTarget, setKcalTarget] = useState("2000");
  const [waterGoalMl, setWaterGoalMl] = useState("2000");
  const [healthGoal, setHealthGoal] = useState("maintain");

  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);

  // Profile form fields
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  const loadProfile = async () => {
    const profile = await profileService.getCurrentProfile();
    if (profile) {
      setFullName(profile.full_name || "");
      setNickname(profile.nickname || "");
      setAge(profile.age?.toString() || "");
      setWeight(profile.weight?.toString() || "");
      setGender(profile.gender || "");
      setAvatarUrl(profile.avatar_url || null);
      
      // Load nutritional goals
      setFiberMin(profile.fiber_min?.toString() || "25");
      setFiberMax(profile.fiber_max?.toString() || "30");
      setFiberTarget(profile.fiber_target?.toString() || "27.5");
      setSugarMin(profile.sugar_min?.toString() || "30");
      setSugarMax(profile.sugar_max?.toString() || "50");
      setSugarTarget(profile.sugar_target?.toString() || "40");
      setCarbsMin(profile.carbs_min?.toString() || "200");
      setCarbsMax(profile.carbs_max?.toString() || "300");
      setCarbsTarget(profile.carbs_target?.toString() || "250");
      setFatsMin(profile.fats_min?.toString() || "50");
      setFatsMax(profile.fats_max?.toString() || "60");
      setFatsTarget(profile.fats_target?.toString() || "55");
      setProteinMin(profile.protein_min?.toString() || "50");
      setProteinMax(profile.protein_max?.toString() || "100");
      setProteinTarget(profile.protein_target?.toString() || "75");
      setSaltMax(profile.salt_max?.toString() || "6");
      setKcalMin(profile.kcal_min?.toString() || "1500");
      setKcalMax(profile.kcal_max?.toString() || "2500");
      setKcalTarget(profile.kcal_target?.toString() || "2000");
      setWaterGoalMl(profile.water_goal_ml?.toString() || "2000");
      setHealthGoal(profile.health_goal || "maintain");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profileService.updateProfile({
        full_name: fullName || null,
        nickname: nickname || null,
        age: age ? parseInt(age) : null,
        weight: weight ? parseFloat(weight) : null,
        gender: (gender as "male" | "female" | "other") || null,
        avatar_url: avatarUrl || null,
      });

      toast({
        title: "Úspech",
        description: "Profil bol aktualizovaný",
      });
      
      onProfileUpdated();
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa aktualizovať profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Chyba",
        description: "Súbor je príliš veľký. Maximálna veľkosť je 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Delete old avatar if exists
      if (avatarUrl) {
        await profileService.deleteAvatar(avatarUrl);
      }

      const url = await profileService.uploadAvatar(file);
      setAvatarUrl(url);
      
      // Update profile immediately
      await profileService.updateProfile({ avatar_url: url });
      
      // Force reload profile to get fresh data
      if (onProfileUpdated) {
        await onProfileUpdated();
      }

      toast({
        title: "Úspech",
        description: "Profilová fotka bola nahraná",
      });

      // Clear file input
      e.target.value = "";
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa nahrať fotku",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!avatarUrl) return;

    setUploading(true);
    try {
      await profileService.deleteAvatar(avatarUrl);
      setAvatarUrl(null);
      
      // Update profile immediately to remove avatar URL
      await profileService.updateProfile({ avatar_url: null });
      
      // Force reload profile to get fresh data
      if (onProfileUpdated) {
        await onProfileUpdated();
      }

      toast({
        title: "Úspech",
        description: "Profilová fotka bola odstránená",
      });
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa odstrániť fotku",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Chyba",
        description: "Heslá sa nezhodujú",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Chyba",
        description: "Heslo musí mať aspoň 6 znakov",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await profileService.changePassword(newPassword);
      toast({
        title: "Úspech",
        description: "Heslo bolo zmenené",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa zmeniť heslo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoalsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profileService.updateProfile({
        fiber_min: fiberMin ? parseFloat(fiberMin) : null,
        fiber_max: fiberMax ? parseFloat(fiberMax) : null,
        fiber_target: fiberTarget ? parseFloat(fiberTarget) : null,
        sugar_min: sugarMin ? parseFloat(sugarMin) : null,
        sugar_max: sugarMax ? parseFloat(sugarMax) : null,
        sugar_target: sugarTarget ? parseFloat(sugarTarget) : null,
        carbs_min: carbsMin ? parseFloat(carbsMin) : null,
        carbs_max: carbsMax ? parseFloat(carbsMax) : null,
        carbs_target: carbsTarget ? parseFloat(carbsTarget) : null,
        fats_min: fatsMin ? parseFloat(fatsMin) : null,
        fats_max: fatsMax ? parseFloat(fatsMax) : null,
        fats_target: fatsTarget ? parseFloat(fatsTarget) : null,
        protein_min: proteinMin ? parseFloat(proteinMin) : null,
        protein_max: proteinMax ? parseFloat(proteinMax) : null,
        protein_target: proteinTarget ? parseFloat(proteinTarget) : null,
        salt_max: saltMax ? parseFloat(saltMax) : null,
        kcal_min: kcalMin ? parseFloat(kcalMin) : null,
        kcal_max: kcalMax ? parseFloat(kcalMax) : null,
        kcal_target: kcalTarget ? parseFloat(kcalTarget) : null,
        water_goal_ml: waterGoalMl ? parseInt(waterGoalMl) : null,
        health_goal: healthGoal as "lose_weight" | "maintain" | "gain_muscle" | "improve_digestion",
      });

      if (onProfileUpdated) {
        await onProfileUpdated();
      }

      toast({
        title: "Úspech",
        description: "Nutričné ciele boli uložené",
      });
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa uložiť ciele",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportBackup = async () => {
    setExportingBackup(true);
    try {
      await backupService.exportBackup();
      toast({
        title: "Záloha exportovaná",
        description: "Záloha bola úspešne stiahnutá do Downloads priečinka.",
      });
    } catch (error) {
      console.error("Export backup error:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa exportovať zálohu.",
        variant: "destructive",
      });
    } finally {
      setExportingBackup(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedBackupFile(file || null);
  };

  const handleImportBackup = async () => {
    if (!selectedBackupFile) return;

    setImportingBackup(true);
    try {
      await backupService.importBackup(selectedBackupFile);
      toast({
        title: "Záloha importovaná",
        description: "Vaše dáta boli úspešne obnovené zo zálohy.",
      });
      setSelectedBackupFile(null);
      onOpenChange(false);
      // Reload page to show restored data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Import backup error:", error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa importovať zálohu.",
        variant: "destructive",
      });
    } finally {
      setImportingBackup(false);
    }
  };

  const getInitials = () => {
    if (nickname) return nickname.charAt(0).toUpperCase();
    if (fullName) return fullName.charAt(0).toUpperCase();
    return "?";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Profil</DialogTitle>
          <DialogDescription>
            Upravte svoje osobné údaje a nastavenia
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="weight">Hmotnosť</TabsTrigger>
            <TabsTrigger value="calories">Kalórie</TabsTrigger>
            <TabsTrigger value="water">Voda</TabsTrigger>
            <TabsTrigger value="backup">Zálohovanie</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="flex-1 overflow-y-auto mt-4 space-y-4">
            <form onSubmit={handleProfileUpdate} className="space-y-6 pb-4">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={avatarUrl ? `${avatarUrl}?t=${Date.now()}` : ""} 
                    alt={nickname || fullName || "User"} 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl">
                    {nickname?.charAt(0).toUpperCase() || 
                     fullName?.charAt(0).toUpperCase() || 
                     "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Nahrávam..." : "Zmeniť fotku"}
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAvatarDelete}
                      disabled={uploading}
                    >
                      Odstrániť
                    </Button>
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Max 2MB • JPG, PNG, WebP
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Meno a priezvisko</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ján Novák"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nickname">
                    Prezývka <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Johnny"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Vek</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="30"
                      min="1"
                      max="150"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Váha (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="70.5"
                      min="1"
                      max="500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Pohlavie</Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Nevybrané</option>
                    <option value="male">Muž</option>
                    <option value="female">Žena</option>
                    <option value="other">Iné</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email sa nedá zmeniť
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Ukladám..." : "Uložiť zmeny"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="goals" className="flex-1 overflow-y-auto mt-4 space-y-4">
            <form onSubmit={handleGoalsUpdate} className="space-y-6 pb-4">
              {/* Health Goal */}
              <div className="space-y-2">
                <Label htmlFor="healthGoal">Môj cieľ</Label>
                <select
                  id="healthGoal"
                  value={healthGoal}
                  onChange={(e) => setHealthGoal(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="lose_weight">Schudnúť</option>
                  <option value="maintain">Udržať hmotnosť</option>
                  <option value="gain_muscle">Nabrať svaly</option>
                  <option value="improve_digestion">Zlepšiť trávenie</option>
                </select>
              </div>

              {/* Water Goal */}
              <div className="space-y-2">
                <Label htmlFor="waterGoal">Denný cieľ vody (ml)</Label>
                <Input
                  id="waterGoal"
                  type="number"
                  value={waterGoalMl}
                  onChange={(e) => setWaterGoalMl(e.target.value)}
                  placeholder="2000"
                  min="500"
                  max="5000"
                  step="100"
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Denné limity nutričných hodnôt</h3>
                
                {/* Fiber */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">Vláknina (g)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="fiberMin" className="text-xs text-muted-foreground">Min</Label>
                      <Input
                        id="fiberMin"
                        type="number"
                        value={fiberMin}
                        onChange={(e) => setFiberMin(e.target.value)}
                        placeholder="25"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="fiberTarget" className="text-xs text-muted-foreground">Cieľ</Label>
                      <Input
                        id="fiberTarget"
                        type="number"
                        value={fiberTarget}
                        onChange={(e) => setFiberTarget(e.target.value)}
                        placeholder="27.5"
                        min="0"
                        max="100"
                        step="0.1"
                        className="border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="fiberMax" className="text-xs text-muted-foreground">Max</Label>
                      <Input
                        id="fiberMax"
                        type="number"
                        value={fiberMax}
                        onChange={(e) => setFiberMax(e.target.value)}
                        placeholder="30"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Sugar */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">Cukry (g)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="sugarMin" className="text-xs text-muted-foreground">Min</Label>
                      <Input
                        id="sugarMin"
                        type="number"
                        value={sugarMin}
                        onChange={(e) => setSugarMin(e.target.value)}
                        placeholder="30"
                        min="0"
                        max="200"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="sugarTarget" className="text-xs text-muted-foreground">Cieľ</Label>
                      <Input
                        id="sugarTarget"
                        type="number"
                        value={sugarTarget}
                        onChange={(e) => setSugarTarget(e.target.value)}
                        placeholder="40"
                        min="0"
                        max="200"
                        step="0.1"
                        className="border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="sugarMax" className="text-xs text-muted-foreground">Max</Label>
                      <Input
                        id="sugarMax"
                        type="number"
                        value={sugarMax}
                        onChange={(e) => setSugarMax(e.target.value)}
                        placeholder="50"
                        min="0"
                        max="200"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Carbs */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">Sacharidy (g)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="carbsMin" className="text-xs text-muted-foreground">Min</Label>
                      <Input
                        id="carbsMin"
                        type="number"
                        value={carbsMin}
                        onChange={(e) => setCarbsMin(e.target.value)}
                        placeholder="200"
                        min="0"
                        max="1000"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="carbsTarget" className="text-xs text-muted-foreground">Cieľ</Label>
                      <Input
                        id="carbsTarget"
                        type="number"
                        value={carbsTarget}
                        onChange={(e) => setCarbsTarget(e.target.value)}
                        placeholder="250"
                        min="0"
                        max="1000"
                        step="0.1"
                        className="border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="carbsMax" className="text-xs text-muted-foreground">Max</Label>
                      <Input
                        id="carbsMax"
                        type="number"
                        value={carbsMax}
                        onChange={(e) => setCarbsMax(e.target.value)}
                        placeholder="300"
                        min="0"
                        max="1000"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Fats */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">Tuky (g)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="fatsMin" className="text-xs text-muted-foreground">Min</Label>
                      <Input
                        id="fatsMin"
                        type="number"
                        value={fatsMin}
                        onChange={(e) => setFatsMin(e.target.value)}
                        placeholder="50"
                        min="0"
                        max="500"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="fatsTarget" className="text-xs text-muted-foreground">Cieľ</Label>
                      <Input
                        id="fatsTarget"
                        type="number"
                        value={fatsTarget}
                        onChange={(e) => setFatsTarget(e.target.value)}
                        placeholder="55"
                        min="0"
                        max="500"
                        step="0.1"
                        className="border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="fatsMax" className="text-xs text-muted-foreground">Max</Label>
                      <Input
                        id="fatsMax"
                        type="number"
                        value={fatsMax}
                        onChange={(e) => setFatsMax(e.target.value)}
                        placeholder="60"
                        min="0"
                        max="500"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Protein */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">Bielkoviny (g)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="proteinMin" className="text-xs text-muted-foreground">Min</Label>
                      <Input
                        id="proteinMin"
                        type="number"
                        value={proteinMin}
                        onChange={(e) => setProteinMin(e.target.value)}
                        placeholder="50"
                        min="0"
                        max="500"
                        step="0.1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="proteinTarget" className="text-xs text-muted-foreground">Cieľ</Label>
                      <Input
                        id="proteinTarget"
                        type="number"
                        value={proteinTarget}
                        onChange={(e) => setProteinTarget(e.target.value)}
                        placeholder="75"
                        min="0"
                        max="500"
                        step="0.1"
                        className="border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="proteinMax" className="text-xs text-muted-foreground">Max</Label>
                      <Input
                        id="proteinMax"
                        type="number"
                        value={proteinMax}
                        onChange={(e) => setProteinMax(e.target.value)}
                        placeholder="100"
                        min="0"
                        max="500"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>

                {/* Salt */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="saltMax">Soľ max (g)</Label>
                  <Input
                    id="saltMax"
                    type="number"
                    value={saltMax}
                    onChange={(e) => setSaltMax(e.target.value)}
                    placeholder="6"
                    min="0"
                    max="20"
                    step="0.1"
                  />
                </div>

                {/* Calories */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">Kalórie</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="kcalMin" className="text-xs text-muted-foreground">Min</Label>
                      <Input
                        id="kcalMin"
                        type="number"
                        value={kcalMin}
                        onChange={(e) => setKcalMin(e.target.value)}
                        placeholder="1500"
                        min="500"
                        max="10000"
                        step="10"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="kcalTarget" className="text-xs text-muted-foreground">Cieľ</Label>
                      <Input
                        id="kcalTarget"
                        type="number"
                        value={kcalTarget}
                        onChange={(e) => setKcalTarget(e.target.value)}
                        placeholder="2000"
                        min="500"
                        max="10000"
                        step="10"
                        className="border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="kcalMax" className="text-xs text-muted-foreground">Max</Label>
                      <Input
                        id="kcalMax"
                        type="number"
                        value={kcalMax}
                        onChange={(e) => setKcalMax(e.target.value)}
                        placeholder="2500"
                        min="500"
                        max="10000"
                        step="10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Ukladám..." : "Uložiť ciele"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="password" className="flex-1 overflow-y-auto mt-4 space-y-4">
            <form onSubmit={handlePasswordChange} className="space-y-6 pb-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nové heslo</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimálne 6 znakov
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Potvrďte nové heslo</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Mením heslo..." : "Zmeniť heslo"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export zálohy</CardTitle>
                <CardDescription>
                  Stiahnite kompletnú zálohu svojich dát (databáza + súbory)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Záloha obsahuje všetky vaše potraviny, jedálničky, aktivity, lieky, WC záznamy,
                  pitný režim, denné súhrny a nahrané obrázky.
                </p>
                <Button
                  onClick={handleExportBackup}
                  disabled={exportingBackup}
                  className="w-full"
                >
                  {exportingBackup ? (
                    <>
                      <span className="mr-2">Exportuje sa...</span>
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Exportovať zálohu
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import zálohy</CardTitle>
                <CardDescription>
                  Obnovte svoje dáta zo zálohy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vyberte súbor zálohy (.zip) zo zariadenia. Existujúce dáta budú nahradené.
                </p>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".zip"
                    onChange={handleFileSelect}
                    disabled={importingBackup}
                  />
                  <Button
                    onClick={handleImportBackup}
                    disabled={!selectedBackupFile || importingBackup}
                    className="w-full"
                    variant="outline"
                  >
                    {importingBackup ? (
                      <>
                        <span className="mr-2">Importuje sa...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Importovať zálohu
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}