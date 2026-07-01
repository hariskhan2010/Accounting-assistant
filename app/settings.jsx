import { useCallback, useEffect, useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { FadeInView } from "@/components/animated/FadeInView";
import { Card } from "@/components/ui/Card";
import { GoldButton } from "@/components/ui/GoldButton";
import { LuxuryTextInput } from "@/components/ui/LuxuryTextInput";
import { colors } from "@/theme";
import { loadCredentials, saveCredentials, disconnectPlatform, PLATFORM_WEBHOOK_URLS } from "@/modules/orders/platformCredentialsService";

const SUPABASE_REF = "hyjfqsxavrykjzmaaasd";

export default function SettingsScreen() {
  const [ebay, setEbay] = useState({ clientId: "", clientSecret: "", verificationToken: "", webhookUrl: "", isConnected: false });
  const [etsy, setEtsy] = useState({ apiKey: "", apiSecret: "", webhookUrl: "", isConnected: false });
  const [ebayDirty, setEbayDirty] = useState(false);
  const [etsyDirty, setEtsyDirty] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCredentials().then((creds) => {
        setEbay({ ...creds.ebay, webhookUrl: PLATFORM_WEBHOOK_URLS.ebay(SUPABASE_REF) });
        setEtsy({ ...creds.etsy, webhookUrl: PLATFORM_WEBHOOK_URLS.etsy(SUPABASE_REF) });
      });
    }, [])
  );

  async function handleSaveEbay() {
    const result = await saveCredentials("ebay", {
      clientId: ebay.clientId,
      clientSecret: ebay.clientSecret,
      verificationToken: ebay.verificationToken,
      isConnected: Boolean(ebay.clientId && ebay.clientSecret)
    });
    setEbay({ ...result.ebay, webhookUrl: PLATFORM_WEBHOOK_URLS.ebay(SUPABASE_REF) });
    setEbayDirty(false);
    Alert.alert("eBay", result.ebay.isConnected ? "Connected successfully." : "Saved. Fill Client ID + Secret to connect.");
  }

  async function handleSaveEtsy() {
    const result = await saveCredentials("etsy", {
      apiKey: etsy.apiKey,
      apiSecret: etsy.apiSecret,
      isConnected: Boolean(etsy.apiKey && etsy.apiSecret)
    });
    setEtsy({ ...result.etsy, webhookUrl: PLATFORM_WEBHOOK_URLS.etsy(SUPABASE_REF) });
    setEtsyDirty(false);
    Alert.alert("Etsy", result.etsy.isConnected ? "Connected successfully." : "Saved. Fill API Key + Secret to connect.");
  }

  async function handleDisconnect(platform) {
    Alert.alert(
      `Disconnect ${platform === "ebay" ? "eBay" : "Etsy"}`,
      "Webhooks will stop processing new orders.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            await disconnectPlatform(platform);
            if (platform === "ebay") {
              setEbay({ clientId: "", clientSecret: "", verificationToken: "", webhookUrl: PLATFORM_WEBHOOK_URLS.ebay(SUPABASE_REF), isConnected: false });
            } else {
              setEtsy({ apiKey: "", apiSecret: "", webhookUrl: PLATFORM_WEBHOOK_URLS.etsy(SUPABASE_REF), isConnected: false });
            }
          }
        }
      ]
    );
  }

  function openUrl(url) {
    Linking.openURL(url);
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
            {ebay.isConnected ? (
              <View style={styles.badgeConnected}>
                <Text style={styles.badgeText}>Connected</Text>
              </View>
            ) : (
              <View style={styles.badgeDisconnected}>
                <Text style={styles.badgeTextDim}>Disconnected</Text>
              </View>
            )}
          </View>

          <Text style={styles.stepText}>
            1. Go to developer.ebay.com → create an app{'\n'}
            2. Get Client ID + Client Secret{'\n'}
            3. Set webhook URL in your eBay app settings
          </Text>
          <GoldButton title="Open eBay Developer" variant="secondary" onPress={() => openUrl("https://developer.ebay.com")} style={styles.devBtn} />

          <Text style={styles.inputLabel}>Webhook URL</Text>
          <LuxuryTextInput value={ebay.webhookUrl} editable={false} autoCapitalize="none" autoCorrect={false} />

          <Text style={styles.inputLabel}>Client ID</Text>
          <LuxuryTextInput placeholder="Your eBay Client ID" value={ebay.clientId} onChangeText={(v) => { setEbay((p) => ({ ...p, clientId: v })); setEbayDirty(true); }} />

          <Text style={styles.inputLabel}>Client Secret</Text>
          <LuxuryTextInput placeholder="Your eBay Client Secret" value={ebay.clientSecret} onChangeText={(v) => { setEbay((p) => ({ ...p, clientSecret: v })); setEbayDirty(true); }} secureTextEntry />

          <Text style={styles.inputLabel}>Verification Token</Text>
          <LuxuryTextInput placeholder="eBay webhook verification token" value={ebay.verificationToken} onChangeText={(v) => { setEbay((p) => ({ ...p, verificationToken: v })); setEbayDirty(true); }} secureTextEntry />

          <View style={styles.buttonRow}>
            <GoldButton title={ebay.isConnected ? "Update" : "Save & Connect"} onPress={handleSaveEbay} disabled={!ebayDirty} style={styles.saveBtn} />
            {ebay.isConnected ? (
              <GoldButton title="Disconnect" variant="ghost" onPress={() => handleDisconnect("ebay")} style={styles.disconnectBtn} />
            ) : null}
          </View>
        </Card>
      </FadeInView>

      <FadeInView delay={120}>
        <Card>
          <View style={styles.sectionHeader}>
            <Ionicons name="storefront" size={20} color="#F1641E" />
            <Text style={styles.sectionTitle}>Etsy Connection</Text>
            {etsy.isConnected ? (
              <View style={styles.badgeConnected}>
                <Text style={styles.badgeText}>Connected</Text>
              </View>
            ) : (
              <View style={styles.badgeDisconnected}>
                <Text style={styles.badgeTextDim}>Disconnected</Text>
              </View>
            )}
          </View>

          <Text style={styles.stepText}>
            1. Go to etsy.com/developers → sign in{'\n'}
            2. Create a New App → get API Key + Secret{'\n'}
            3. Set webhook URL in your app settings
          </Text>
          <GoldButton title="Open Etsy Developer" variant="secondary" onPress={() => openUrl("https://www.etsy.com/developers/your-apps")} style={styles.devBtn} />

          <Text style={styles.inputLabel}>Webhook URL</Text>
          <LuxuryTextInput value={etsy.webhookUrl} editable={false} autoCapitalize="none" autoCorrect={false} />

          <Text style={styles.inputLabel}>API Key</Text>
          <LuxuryTextInput placeholder="Your Etsy API Key" value={etsy.apiKey} onChangeText={(v) => { setEtsy((p) => ({ ...p, apiKey: v })); setEtsyDirty(true); }} />

          <Text style={styles.inputLabel}>API Secret</Text>
          <LuxuryTextInput placeholder="Your Etsy API Secret" value={etsy.apiSecret} onChangeText={(v) => { setEtsy((p) => ({ ...p, apiSecret: v })); setEtsyDirty(true); }} secureTextEntry />

          <View style={styles.buttonRow}>
            <GoldButton title={etsy.isConnected ? "Update" : "Save & Connect"} onPress={handleSaveEtsy} disabled={!etsyDirty} style={styles.saveBtn} />
            {etsy.isConnected ? (
              <GoldButton title="Disconnect" variant="ghost" onPress={() => handleDisconnect("etsy")} style={styles.disconnectBtn} />
            ) : null}
          </View>
        </Card>
      </FadeInView>

      <FadeInView delay={160}>
        <Card variant="outline">
          <Text style={styles.deployTitle}>Deploy Webhooks</Text>
          <Text style={styles.deployText}>
            Run these commands to deploy the webhook edge functions to Supabase:
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>
              npx.cmd supabase functions deploy ebay-webhook --project-ref {SUPABASE_REF}{'\n'}
              npx.cmd supabase functions deploy etsy-webhook --project-ref {SUPABASE_REF}{'\n'}{'\n'}
              npx.cmd supabase secrets set EBAY_WEBHOOK_VERIFICATION_TOKEN=your_token --project-ref {SUPABASE_REF}
            </Text>
          </View>
        </Card>
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  badgeConnected: {
    backgroundColor: "rgba(110, 170, 94, 0.15)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3
  },
  badgeDisconnected: {
    backgroundColor: "rgba(107, 98, 80, 0.15)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3
  },
  badgeText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "700"
  },
  badgeTextDim: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "600"
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  codeBox: {
    backgroundColor: colors.backgroundDeep,
    borderRadius: 10,
    padding: 12
  },
  codeText: {
    color: colors.primary,
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18
  },
  content: {
    gap: 20,
    padding: 16,
    paddingTop: 60
  },
  deployText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10
  },
  deployTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4
  },
  devBtn: {
    marginBottom: 12
  },
  disconnectBtn: {
    flex: 0
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  inputLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 10,
    textTransform: "uppercase"
  },
  saveBtn: {
    flex: 1
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
    flex: 1,
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
