import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

const PHONE_REGEX = /^01[0125]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_HOST = "http://10.0.0.99:5000";

const VEHICLE_OPTIONS = [
  { value: "car", label: "🚗 Car" },
  { value: "motorcycle", label: "🏍 Motorcycle" },
  { value: "bike", label: "🚲 Bike" },
];

export default function ProfileScreen({ navigation }) {
  const [tab, setTab] = useState("info");
  const [loading, setLoading] = useState(true);

  // User profile
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [original, setOriginal] = useState({});
  const [saving, setSaving] = useState(false);

  // Vehicle
  const [vehicleType, setVehicleType] = useState("car");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleOriginal, setVehicleOriginal] = useState({});
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Avatar
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [userRes, driverRes] = await Promise.all([
        api.get("/users/me"),
        api.get("/drivers/me").catch(() => ({ data: null })),
      ]);

      setName(userRes.data.name || "");
      setPhone(userRes.data.phone || "");
      setEmail(userRes.data.email || "");
      setAvatar(userRes.data.avatar || null);
      setOriginal({
        name: userRes.data.name || "",
        phone: userRes.data.phone || "",
        email: userRes.data.email || "",
      });

      if (driverRes.data) {
        setVehicleType(driverRes.data.vehicleType || "car");
        setVehicleNumber(driverRes.data.vehicleNumber || "");
        setVehicleOriginal({
          vehicleType: driverRes.data.vehicleType || "car",
          vehicleNumber: driverRes.data.vehicleNumber || "",
        });
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInfo = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      return Alert.alert("Invalid name", "Name must be at least 2 characters");
    }
    if (!PHONE_REGEX.test(phone)) {
      return Alert.alert(
        "Invalid phone",
        "Phone must be 11 digits starting with 010/011/012/015"
      );
    }
    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      return Alert.alert("Invalid email", "Please enter a valid email");
    }

    const payload = {};
    if (trimmedName !== original.name) payload.name = trimmedName;
    if (phone !== original.phone) payload.phone = phone;
    if (trimmedEmail !== (original.email || "")) {
      payload.email = trimmedEmail || "";
    }

    if (Object.keys(payload).length === 0) {
      return Alert.alert("No changes", "Nothing to update");
    }

    setSaving(true);
    try {
      const res = await api.patch("/users/me", payload);
      const u = res.data.user;
      setOriginal({
        name: u.name,
        phone: u.phone,
        email: u.email || "",
      });
      Alert.alert("Success", "Profile updated");
    } catch (err) {
      Alert.alert(
        "Update failed",
        err.response?.data?.message || "Could not update"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVehicle = async () => {
    const trimmed = vehicleNumber.trim();
    if (trimmed && (trimmed.length < 2 || trimmed.length > 20)) {
      return Alert.alert("Invalid", "Vehicle number must be 2-20 characters");
    }

    const payload = {};
    if (vehicleType !== vehicleOriginal.vehicleType)
      payload.vehicleType = vehicleType;
    if (trimmed !== (vehicleOriginal.vehicleNumber || ""))
      payload.vehicleNumber = trimmed;

    if (Object.keys(payload).length === 0) {
      return Alert.alert("No changes", "Nothing to update");
    }

    setSavingVehicle(true);
    try {
      const res = await api.patch("/drivers/me", payload);
      setVehicleOriginal({
        vehicleType: res.data.driver.vehicleType,
        vehicleNumber: res.data.driver.vehicleNumber || "",
      });
      Alert.alert("Success", "Vehicle info updated");
    } catch (err) {
      Alert.alert(
        "Update failed",
        err.response?.data?.message || "Could not update"
      );
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert("Error", "All password fields are required");
    }
    if (newPassword.length < 6) {
      return Alert.alert("Weak password", "New password must be at least 6 characters");
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert("Mismatch", "New password and confirmation don't match");
    }
    if (currentPassword === newPassword) {
      return Alert.alert("Error", "New password must be different from current");
    }

    setChangingPassword(true);
    try {
      await api.patch("/users/me/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Password changed");
    } catch (err) {
      Alert.alert(
        "Change failed",
        err.response?.data?.message || "Could not change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return Alert.alert("Permission denied", "We need access to your photos");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const filename = asset.uri.split("/").pop() || "avatar.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : "jpg";
    const mime = `image/${ext === "jpg" ? "jpeg" : ext}`;

    const form = new FormData();
    form.append("avatar", {
      uri: asset.uri,
      name: filename,
      type: mime,
    });

    setUploadingAvatar(true);
    try {
      const res = await api.post("/users/me/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatar(res.data.avatar);
      Alert.alert("Success", "Profile picture updated");
    } catch (err) {
      Alert.alert(
        "Upload failed",
        err.response?.data?.message || "Could not upload image"
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const avatarUrl = avatar ? `${API_HOST}/uploads/${avatar}` : null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={pickAvatar}
            activeOpacity={0.8}
            disabled={uploadingAvatar}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {(name || "?").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ fontSize: 14 }}>📷</Text>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarName}>{name}</Text>
          <Text style={styles.avatarPhone}>{phone}</Text>
        </View>

        <View style={styles.tabs}>
          {["info", "vehicle", "password"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text
                style={[styles.tabText, tab === t && styles.tabTextActive]}
              >
                {t === "info" ? "Info" : t === "vehicle" ? "Vehicle" : "Password"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "info" && (
          <View style={styles.card}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              editable={!saving}
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="01012345678"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              maxLength={11}
              style={styles.input}
              editable={!saving}
            />

            <Text style={styles.label}>Email (optional)</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              editable={!saving}
            />

            <TouchableOpacity
              style={[styles.primaryButton, saving && { opacity: 0.7 }]}
              onPress={handleSaveInfo}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {tab === "vehicle" && (
          <View style={styles.card}>
            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.vehicleRow}>
              {VEHICLE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.vehicleChip,
                    vehicleType === opt.value && styles.vehicleChipActive,
                  ]}
                  onPress={() => setVehicleType(opt.value)}
                >
                  <Text
                    style={[
                      styles.vehicleChipText,
                      vehicleType === opt.value &&
                        styles.vehicleChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Vehicle Number / License Plate</Text>
            <TextInput
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              placeholder="e.g. ABC-1234"
              placeholderTextColor="#9ca3af"
              autoCapitalize="characters"
              maxLength={20}
              style={styles.input}
              editable={!savingVehicle}
            />

            <TouchableOpacity
              style={[styles.primaryButton, savingVehicle && { opacity: 0.7 }]}
              onPress={handleSaveVehicle}
              disabled={savingVehicle}
            >
              {savingVehicle ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Vehicle Info</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {tab === "password" && (
          <View style={styles.card}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showCurrent}
                style={styles.passwordInput}
                editable={!changingPassword}
              />
              <TouchableOpacity
                onPress={() => setShowCurrent((s) => !s)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeText}>{showCurrent ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 6 characters"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showNew}
                style={styles.passwordInput}
                editable={!changingPassword}
              />
              <TouchableOpacity
                onPress={() => setShowNew((s) => !s)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeText}>{showNew ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat new password"
              placeholderTextColor="#9ca3af"
              secureTextEntry={!showNew}
              style={styles.input}
              editable={!changingPassword}
            />

            <TouchableOpacity
              style={[
                styles.primaryButton,
                changingPassword && { opacity: 0.7 },
              ]}
              onPress={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f4f8" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f4f8",
  },
  backRow: { marginBottom: 8 },
  backText: { color: "#4f46e5", fontWeight: "600", fontSize: 14 },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarWrap: { position: "relative", marginBottom: 12 },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e5e7eb",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 42, fontWeight: "bold" },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarName: { fontSize: 20, fontWeight: "700", color: "#1f2937" },
  avatarPhone: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tab: { flex: 1, paddingVertical: 11, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: "#4f46e5" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#6b7280" },
  tabTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    color: "#1f2937",
    fontSize: 14,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 14,
  },
  passwordInput: { flex: 1, padding: 14, color: "#1f2937", fontSize: 14 },
  eyeButton: { paddingHorizontal: 14, paddingVertical: 12 },
  eyeText: { fontSize: 18 },
  vehicleRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  vehicleChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  vehicleChipActive: {
    backgroundColor: "#eef2ff",
    borderColor: "#4f46e5",
  },
  vehicleChipText: { fontSize: 12, color: "#6b7280", fontWeight: "600" },
  vehicleChipTextActive: { color: "#4f46e5" },
  primaryButton: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    minHeight: 52,
    justifyContent: "center",
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
