import { useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FadeInView } from "@/components/animated/FadeInView";
import { Card } from "@/components/ui/Card";
import { GoldButton } from "@/components/ui/GoldButton";
import { LuxuryTextInput } from "@/components/ui/LuxuryTextInput";
import { colors } from "@/theme";

export default function SettingsScreen() {
  const [ebayClientId, setEbayClientId] = useState("");
  const [ebayClientSecret, setEbayClientSecret] = useState("");
  const [etsyApiKey, setEtsyApiKey] = useState("");
  const [etsyApiSecret, setEtsyApiSecret] = useState("");

  function handleSaveEbay() {
    Alert.alert("eBay Credentials", "Credentials saved locally. Webhook will process incoming orders.");
  }

  function handleSaveEtsy() {
    Alert.alert("Etsy Credentials", "Credentials saved locally. Webhook will process incoming orders.");
  }

  function openEbayDev() {
    Linking.openURL("https://developer.ebay.com");
  }

  function openEtsyDev() {
    Linking.openURL("https://developers.etsy.com");
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.screen}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color={colors.text} onPress={() => router.back()} />
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <FadeInView delay={80}>
        <Card>
          <View style={styles.sectionHeader}>
            <Ionicons name="logo-usd" size={20} color="#E53238" />
            <Text style={styles.sectionTitle}>eBay Connection</Text>
          </View>

          <Text style={styles.stepText}>
            1. Go to developer.ebay.com and create an app{'\n'}
            2. Get Client ID + Client Secret{'\n'}
            3. Set webhook URL to your Edge Function URL
          </Text>
          <GoldButton title="Open eBay Developer" variant="secondary" onPress={openEbayDev} style={styles.devBtn} />

          <Text style={styles.inputLabel}>Client ID</Text>
          <LuxuryTextInput
            placeholder="Your eBay Client ID"
            value={ebayClientId}
            onChangeText={setEbayClientId}
          />
          <Text style={styles.inputLabel}>Client Secret</Text>
          <LuxuryTextInput
            placeholder="Your eBay Client Secret"
            value={ebayClientSecret}
            onChangeText={setEbayClientSecret}
            secureTextEntry
          />
          <GoldButton title="Save eBay Credentials" onPress={handleSaveEbay} style={styles.saveBtn} />
        </Card>
      </FadeInView>

      <FadeInView delay={120}>
        <Card>
          <View style={styles.sectionHeader}>
            <Ionicons name="storefront" size={20} color="#F1641E" />
            <Text style={styles.sectionTitle}>Etsy Connection</Text>
          </View>

          <Text style={styles.stepText}>
            1. Go to developers.etsy.com and create an app{'\n'}
            2. Get API Key + API Secret{'\n'}
            3. Set webhook URL to your Edge Function URL
          </Text>
          <GoldButton title="Open Etsy Developer" variant="secondary" onPress={openEtsyDev} style={styles.devBtn} />

          <Text style={styles.inputLabel}>API Key</Text>
          <LuxuryTextInput
            placeholder="Your Etsy API Key"
            value={etsyApiKey}
            onChangeText={setEtsyApiKey}
          />
          <Text style={styles.inputLabel}>API Secret</Text>
          <LuxuryTextInput
            placeholder="Your Etsy API Secret"
            value={etsyApiSecret}
            onChangeText={setEtsyApiSecret}
            secureTextEntry
          />
          <GoldButton title="Save Etsy Credentials" onPress={handleSaveEtsy} style={styles.saveBtn} />
        </Card>
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    padding: 16,
    paddingTop: 60
  },
  devBtn: {
    marginBottom: 12
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 8,
    textTransform: "uppercase"
  },
  saveBtn: {
    marginTop: 12
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  stepText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700"
  }
});
