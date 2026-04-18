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
import { Upload, Trash2, User } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated: () => void;
}

export function ProfileDialog({ open, onOpenChange, onProfileUpdated }: ProfileDialogProps) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Nutritional goals state
  const [fiberMin, setFiberMin] = useState("25");
  const [fiberMax, setFiberMax] = useState("30");
  const [sugarMin, setSugarMin] = useState("30");
  const [sugarMax, setSugarMax] = useState("50");
  const [carbsMin, setCarbsMin] = useState("200");
  const [carbsMax, setCarbsMax] = useState("300");
  const [fatsMin, setFatsMin] = useState("50");
  const [fatsMax, setFatsMax] = useState("60");
  const [proteinMin, setProteinMin] = useState("50");
  const [proteinMax, setProteinMax] = useState("100");
  const [saltMax, setSaltMax] = useState("6");
  const [kcalMin, setKcalMin] = useState("1500");
  const [kcalMax, setKcalMax] = useState("2500");
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
      setSugarMin(profile.sugar_min?.toString() || "30");
      setSugarMax(profile.sugar_max?.toString() || "50");
      setCarbsMin(profile.carbs_min?.toString() || "200");
      setCarbsMax(profile.carbs_max?.toString() || "300");
      setFatsMin(profile.fats_min?.toString() || "50");
      setFatsMax(profile.fats_max?.toString() || "60");
      setProteinMin(profile.protein_min?.toString() || "50");
      setProteinMax(profile.protein_max?.toString() || "100");
      setSaltMax(profile.salt_max?.toString() || "6");
      setKcalMin(profile.kcal_min?.toString() || "1500");
      setKcalMax(profile.kcal_max?.toString() || "2500");
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
        sugar_min: sugarMin ? parseFloat(sugarMin) : null,
        sugar_max: sugarMax ? parseFloat(sugarMax) : null,
        carbs_min: carbsMin ? parseFloat(carbsMin) : null,
        carbs_max: carbsMax ? parseFloat(carbsMax) : null,
        fats_min: fatsMin ? parseFloat(fatsMin) : null,
        fats_max: fatsMax ? parseFloat(fatsMax) : null,
        protein_min: proteinMin ? parseFloat(proteinMin) : null,
        protein_max: proteinMax ? parseFloat(proteinMax) : null,
        salt_max: saltMax ? parseFloat(saltMax) : null,
        kcal_min: kcalMin ? parseFloat(kcalMin) : null,
        kcal_max: kcalMax ? parseFloat(kcalMax) : null,
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
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="profile">Osobné údaje</TabsTrigger>
            <TabsTrigger value="goals">Nutričné ciele</TabsTrigger>
            <TabsTrigger value="password">Zmena hesla</TabsTrigger>
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
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="fiberMin">Vláknina min (g)</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="fiberMax">Vláknina max (g)</Label>
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

                {/* Sugar */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="sugarMin">Cukry min (g)</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="sugarMax">Cukry max (g)</Label>
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

                {/* Carbs */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="carbsMin">Sacharidy min (g)</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="carbsMax">Sacharidy max (g)</Label>
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

                {/* Fats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="fatsMin">Tuky min (g)</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="fatsMax">Tuky max (g)</Label>
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

                {/* Protein */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="proteinMin">Bielkoviny min (g)</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="proteinMax">Bielkoviny max (g)</Label>
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
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="kcalMin">Kalórie min</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="kcalMax">Kalórie max</Label>
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
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}