import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import api from "../api/api";

const PHONE_REGEX = /^01[0125]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfileScreen({ navigation }) {
  const [tab, setTab] = useState("info");

  // Profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get("/users/me");
      setName(res.data.name || "");
      setPhone(res.data.phone || "");
      setEmail(res.data.email || "");
      setOriginal({
        name: res.data.name || "",
        phone: res.data.phone || "",
        email: res.data.email || "",
      });
    } catch (err) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
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
      return Alert.alert("Invalid email", "Please enter a valid email address");
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
      const user = res.data.user;
      setOriginal({
        name: user.name,
        phone: user.phone,
        email: user.email || "",
      });
      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      Alert.alert(
        "Update failed",
        err.response?.data?.message || "Could not update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert("Error", "All password fields are required");
    }
    if (newPassword.length < 6) {
      return Alert.alert(
        "Weak password",
        "New password must be at least 6 characters"
      );
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert("Mismatch", "New password and confirmation don't match");
    }
    if (currentPassword === newPassword) {
      return Alert.alert(
        "Error",
        "New password must be different from current"
      );
    }

    setChangingPassword(true);
    try {
      await api.patch("/users/me/password", {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Password changed successfully");
    } catch (err) {
      Alert.alert(
        "Change failed",
        err.response?.data?.message || "Could not change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(name || "?").charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.avatarName}>{name}</Text>
          <Text style={styles.avatarPhone}>{phone}</Text>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === "info" && styles.tabActive]}
            onPress={() => setTab("info")}
          >
            <Text
              style={[styles.tabText, tab === "info" && styles.tabTextActive]}
            >
              Edit Info
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === "password" && styles.tabActive]}
            onPress={() => setTab("password")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "password" && styles.tabTextActive,
              ]}
            >
              Password
            </Text>
          </TouchableOpacity>
        </View>

        {tab === "info" ? (
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

            <Text style={styles.label}>Phone Number</Text>
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
              onPress={handleSaveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
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
  avatarSection: { alignItems: "center", marginBottom: 25 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#4f46e5",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  avatarText: { color: "#fff", fontSize: 38, fontWeight: "bold" },
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
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: { backgroundColor: "#4f46e5" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#6b7280" },
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
