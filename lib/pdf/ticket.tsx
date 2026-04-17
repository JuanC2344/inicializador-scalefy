"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica", fontSize: 10 },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 10, textAlign: "center", color: "#666", marginBottom: 16 },
  section: { marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  label: { color: "#555" },
  bold: { fontFamily: "Helvetica-Bold" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#ddd", marginVertical: 8 },
  total: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  footer: { marginTop: 20, textAlign: "center", color: "#888", fontSize: 9 },
});

interface Item {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  nota?: string | null;
}

interface TicketProps {
  mesa: string;
  items: Item[];
  subtotal: number;
  descuento: number;
  total: number;
  medioPago: string;
  fecha: string;
}

function TicketDoc({ mesa, items, subtotal, descuento, total, medioPago, fecha }: TicketProps) {
  return (
    <Document>
      <Page size={[226, "auto"]} style={styles.page}>
        <Text style={styles.title}>GastroAdmin</Text>
        <Text style={styles.subtitle}>{fecha}</Text>
        <Text style={[styles.bold, { marginBottom: 8 }]}>Mesa: {mesa}</Text>

        <View style={styles.divider} />

        <View style={styles.section}>
          {items.map((item, i) => (
            <View key={i} style={styles.row}>
              <Text style={{ flex: 1 }}>
                {item.cantidad}× {item.nombre}
                {item.nota ? ` (${item.nota})` : ""}
              </Text>
              <Text>${(item.cantidad * item.precioUnitario).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text>${subtotal.toFixed(2)}</Text>
        </View>
        {descuento > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Descuento</Text>
            <Text>-${descuento.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.total, { marginTop: 6 }]}>
          <Text style={styles.bold}>TOTAL</Text>
          <Text style={styles.bold}>${total.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Medio de pago</Text>
          <Text style={{ textTransform: "capitalize" }}>{medioPago}</Text>
        </View>

        <Text style={styles.footer}>¡Gracias por su visita!</Text>
      </Page>
    </Document>
  );
}

interface Props {
  mesa: string;
  items: Item[];
  subtotal: number;
  descuento: number;
  total: number;
  medioPago: string;
}

export function DescargarTicket({ mesa, items, subtotal, descuento, total, medioPago }: Props) {
  const fecha = new Date().toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <PDFDownloadLink
      document={
        <TicketDoc
          mesa={mesa}
          items={items}
          subtotal={subtotal}
          descuento={descuento}
          total={total}
          medioPago={medioPago}
          fecha={fecha}
        />
      }
      fileName={`ticket-${mesa.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`}
    >
      {({ loading }) => (
        <Button variant="outline" className="gap-1.5" disabled={loading}>
          <Download className="h-4 w-4" />
          {loading ? "Generando..." : "Descargar ticket PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
