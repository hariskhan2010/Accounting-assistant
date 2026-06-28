import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Barcode128 } from "@/components/ui/Barcode128";
import { GoldButton } from "@/components/ui/GoldButton";
import { LuxuryTextInput } from "@/components/ui/LuxuryTextInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { generateStockId, generatePaymentId, STOCK_TYPES } from "@/modules/accounting/constants";
import { createStockItem } from "@/modules/orders/stockItemsService";
import { colors } from "@/theme";

const stockTypeOptions = STOCK_TYPES.map((t) => ({ id: t.key, name: t.label }));

export function StockEntryModal({ visible, onClose, onSaved }) {
  const [stockType, setStockType] = useState("investor");
  const [investorName, setInvestorName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [gemType, setGemType] = useState("");
  const [weight, setWeight] = useState("");
  const [gemLength, setGemLength] = useState("");
  const [gemWidth, setGemWidth] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [shippingPrice, setShippingPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [generatedStockId, setGeneratedStockId] = useState(null);
  const [generatedPaymentId, setGeneratedPaymentId] = useState(null);
  const [showBarcode, setShowBarcode] = useState(false);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setStockType("investor");
    setInvestorName("");
    setCompanyName("");
    setGemType("");
    setWeight("");
    setGemLength("");
    setGemWidth("");
    setBuyPrice("");
    setShippingPrice("");
    setSellPrice("");
    setGeneratedStockId(null);
    setGeneratedPaymentId(null);
    setShowBarcode(false);
  }

  function isFormValid() {
    const missing = [];
    if (!gemType.trim()) missing.push("Gem Type");
    if (!weight.trim()) missing.push("Weight");
    if (stockType === "investor" && !investorName.trim()) missing.push("Investor Name");
    if (stockType === "company" && !companyName.trim()) missing.push("Company Name");
    if (!gemLength.trim()) missing.push("Length");
    if (!gemWidth.trim()) missing.push("Width");
    if (!buyPrice.trim()) missing.push("Buy Price");
    if (!shippingPrice.trim()) missing.push("Shipping Price");
    if (!sellPrice.trim()) missing.push("Sell Price");
    return missing;
  }

  function handleGenerateIds() {
    const missing = isFormValid();
    if (missing.length > 0) {
      Alert.alert("Required Fields", "Please fill all fields first:\n• " + missing.join("\n• "));
      return;
    }
    const sid = generateStockId(stockType);
    const pid = generatePaymentId(stockType);
    setGeneratedStockId(sid);
    setGeneratedPaymentId(pid);
    setShowBarcode(true);
  }

  async function handleSave() {
    if (!gemType.trim() || !weight.trim()) {
      Alert.alert("Missing Fields", "Gem type and weight are required.");
      return;
    }
    if (!generatedStockId) {
      Alert.alert("Generate IDs", "Please generate Stock ID and barcode first.");
      return;
    }

    setSaving(true);

    const payload = {
      stockType,
      investorName: stockType === "investor" ? investorName.trim() : "",
      companyName: stockType === "company" ? companyName.trim() : "",
      gemType: gemType.trim(),
      weight: parseFloat(weight) || 0,
      gemLength: gemLength ? parseFloat(gemLength) : null,
      gemWidth: gemWidth ? parseFloat(gemWidth) : null,
      buyPrice: buyPrice ? parseFloat(buyPrice) : null,
      shippingPrice: shippingPrice ? parseFloat(shippingPrice) : null,
      sellPrice: sellPrice ? parseFloat(sellPrice) : null,
      stockId: generatedStockId,
      paymentId: generatedPaymentId
    };

    const { error } = await createStockItem(payload);
    setSaving(false);

    if (error) {
      Alert.alert("Error", "Failed to save stock item.");
      return;
    }

    Alert.alert("Saved", `Stock ID: ${generatedStockId}\nPayment ID: ${generatedPaymentId}`, [
      { text: "OK", onPress: () => { resetForm(); onSaved?.(); onClose(); } }
    ]);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handleRow}>
            <View style={styles.handle} />
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>New Stock Entry</Text>
            <Text style={styles.subtitle}>Enter gem details to generate barcode</Text>

            <Text style={styles.label}>Type</Text>
            <SegmentedControl options={stockTypeOptions} value={stockType} onChange={setStockType} />

            {stockType === "investor" ? (
              <>
                <Text style={styles.label}>Investor Name</Text>
                <LuxuryTextInput
                  placeholder="e.g. Ali Raza"
                  value={investorName}
                  onChangeText={setInvestorName}
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Company Name</Text>
                <LuxuryTextInput
                  placeholder="e.g. Gems Trading Co"
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </>
            )}

            <Text style={styles.label}>Gem Type *</Text>
            <LuxuryTextInput
              placeholder="e.g. Ruby, Emerald, Sapphire"
              value={gemType}
              onChangeText={setGemType}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Weight *</Text>
                <LuxuryTextInput
                  placeholder="e.g. 5.50"
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Unit</Text>
                <View style={styles.unitBox}>
                  <Text style={styles.unitText}>ct</Text>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Length (mm)</Text>
                <LuxuryTextInput
                  placeholder="e.g. 8.5"
                  keyboardType="decimal-pad"
                  value={gemLength}
                  onChangeText={setGemLength}
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Width (mm)</Text>
                <LuxuryTextInput
                  placeholder="e.g. 6.2"
                  keyboardType="decimal-pad"
                  value={gemWidth}
                  onChangeText={setGemWidth}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Pricing</Text>

            <View style={styles.row}>
              <View style={styles.third}>
                <Text style={styles.label}>Buy Price</Text>
                <LuxuryTextInput
                  placeholder="$"
                  keyboardType="decimal-pad"
                  value={buyPrice}
                  onChangeText={setBuyPrice}
                />
              </View>
              <View style={styles.third}>
                <Text style={styles.label}>Shipping</Text>
                <LuxuryTextInput
                  placeholder="$"
                  keyboardType="decimal-pad"
                  value={shippingPrice}
                  onChangeText={setShippingPrice}
                />
              </View>
              <View style={styles.third}>
                <Text style={styles.label}>Sell Price</Text>
                <LuxuryTextInput
                  placeholder="$"
                  keyboardType="decimal-pad"
                  value={sellPrice}
                  onChangeText={setSellPrice}
                />
              </View>
            </View>

            {!generatedStockId ? (
              <GoldButton
                title="Generate Stock ID & Barcode"
                icon={<Ionicons name="barcode-outline" size={18} color={colors.background} />}
                onPress={handleGenerateIds}
                style={styles.generateBtn}
              />
            ) : (
              <View style={styles.barcodeBox}>
                <Barcode128 value={generatedStockId} width={280} height={55} />
                <View style={styles.idRow}>
                  <View>
                    <Text style={styles.idLabel}>Stock ID</Text>
                    <Text style={styles.idValue}>{generatedStockId}</Text>
                  </View>
                  <View>
                    <Text style={styles.idLabel}>Payment ID</Text>
                    <Text style={styles.idValue}>{generatedPaymentId}</Text>
                  </View>
                </View>
              </View>
            )}

            <GoldButton
              title={saving ? "Saving..." : "Save to Stock"}
              onPress={handleSave}
              disabled={saving || !generatedStockId}
              style={styles.saveBtn}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  barcodeBox: {
    alignItems: "center",
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    gap: 10,
    padding: 14
  },
  closeBtn: {
    padding: 4
  },
  content: {
    gap: 16,
    padding: 16
  },
  generateBtn: {
    marginTop: 4
  },
  handle: {
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    height: 4,
    width: 40
  },
  handleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
    paddingHorizontal: 4
  },
  half: {
    flex: 1
  },
  idRow: {
    flexDirection: "row",
    gap: 24,
    justifyContent: "center"
  },
  idLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase"
  },
  idValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
    textAlign: "center"
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase"
  },
  overlay: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: "flex-end"
  },
  row: {
    flexDirection: "row",
    gap: 10
  },
  saveBtn: {
    marginTop: 8
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 32
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    padding: 20,
    paddingBottom: 32
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8
  },
  third: {
    flex: 1
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700"
  },
  unitBox: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
    minHeight: 44
  },
  unitText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700"
  }
});
