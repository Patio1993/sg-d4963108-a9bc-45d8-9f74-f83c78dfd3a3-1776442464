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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Profile form fields
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Password change fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  const loadProfile = async () => {
    try {
      const data = await profileService.getCurrentProfile();
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setNickname(data.nickname || "");
        setAge(data.age?.toString() || "");
        setWeight(data.weight?.toString() || "");
        setGender(data.gender || "");
        setAvatarUrl(data.avatar_url || "");
      }
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa načítať profil",
        variant: "destructive",
      });
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
        description: "Súbor je príliš veľký. Maximum je 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    try {
      const url = await profileService.uploadAvatar(file);
      setAvatarUrl(url);
      toast({
        title: "Úspech",
        description: "Fotka bola nahraná",
      });
    } catch (error: any) {
      toast({
        title: "Chyba",
        description: error.message || "Nepodarilo sa nahrať fotku",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (avatarUrl) {
      try {
        await profileService.deleteAvatar(avatarUrl);
        setAvatarUrl("");
        toast({
          title: "Úspech",
          description: "Fotka bola odstránená",
        });
      } catch (error: any) {
        toast({
          title: "Chyba",
          description: "Nepodarilo sa odstrániť fotku",
          variant: "destructive",
        });
      }
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

  const getInitials = () => {
    if (nickname) return nickname.charAt(0).toUpperCase();
    if (fullName) return fullName.charAt(0).toUpperCase();
    return "?";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Profil používateľa</DialogTitle>
          <DialogDescription>
            Upravte svoje osobné údaje a nastavenia
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Osobné údaje</TabsTrigger>
            <TabsTrigger value="password">Zmena hesla</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4 py-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt={nickname || fullName || "User"} />
                  <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>

                <div className="flex gap-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">{uploadingAvatar ? "Nahráva sa..." : "Nahrať fotku"}</span>
                    </div>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </Label>

                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Odstrániť
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximálna veľkosť: 2MB. Podporované formáty: JPG, PNG, WebP
                </p>
              </div>

              {/* Profile Fields */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Meno a priezvisko</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Napr. Ján Novák"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Prezývka *</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Napr. janko123"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Prezývka sa zobrazí namiesto emailu v aplikácii
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Vek</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="150"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Napr. 30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Váha (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="1"
                    max="500"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Napr. 70.5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Pohlavie</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte pohlavie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Muž</SelectItem>
                    <SelectItem value="female">Žena</SelectItem>
                    <SelectItem value="other">Iné</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Email (len na čítanie)</Label>
                <Input value={profile?.email || ""} disabled />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Ukladá sa..." : "Uložiť zmeny"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="password" className="space-y-4">
            <form onSubmit={handlePasswordChange} className="space-y-4">
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

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Mení sa..." : "Zmeniť heslo"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}