import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Rect, Polygon, Line } from 'react-native-svg';
import { ToothCondition, ToothConditionType, ToothSurface } from '../types';

interface OdontogramProps {
  teethData: Record<number, ToothCondition>;
  onSelectTooth?: (toothNumber: number) => void;
  selectedToothNumber?: number;
  onUpdateCondition?: (toothNumber: number, condition: ToothConditionType, surfaces: ToothSurface[]) => void;
  readOnly?: boolean;
}

// FDI Upper Arch: [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
// FDI Lower Arch: [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const CONDITION_COLORS: Record<ToothConditionType, string> = {
  healthy: '#e2e8f0',
  caries: '#ef4444',
  filling: '#0284c7',
  crown: '#f59e0b',
  rct: '#9333ea',
  implant: '#475569',
  missing: '#cbd5e1',
  extraction: '#ea580c'
};

const CONDITION_LABELS: Record<ToothConditionType, string> = {
  healthy: 'Healthy',
  caries: 'Caries / Cavity',
  filling: 'Restoration',
  crown: 'Crown / Cap',
  rct: 'Root Canal (RCT)',
  implant: 'Implant',
  missing: 'Missing Tooth',
  extraction: 'Extraction'
};

export const Odontogram: React.FC<OdontogramProps> = ({
  teethData,
  onSelectTooth,
  selectedToothNumber,
  onUpdateCondition,
  readOnly = false
}) => {
  const [selectedCondition, setSelectedCondition] = useState<ToothConditionType>('caries');

  const renderSingleTooth = (num: number) => {
    const data = teethData[num];
    const cond = data?.condition || 'healthy';
    const isSelected = selectedToothNumber === num;
    const fillColor = CONDITION_COLORS[cond] || '#e2e8f0';

    return (
      <TouchableOpacity
        key={num}
        style={[
          styles.toothContainer,
          isSelected && styles.selectedToothBorder
        ]}
        onPress={() => {
          if (onSelectTooth) onSelectTooth(num);
          if (!readOnly && onUpdateCondition && selectedToothNumber === num) {
            onUpdateCondition(num, selectedCondition, ['O']);
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.toothNumberText}>#{num}</Text>
        <Svg width={36} height={38} viewBox="0 0 40 40">
          {/* Base tooth outline */}
          <Rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="6"
            fill={cond === 'healthy' ? '#ffffff' : fillColor}
            stroke={isSelected ? '#0284c7' : '#94a3b8'}
            strokeWidth={isSelected ? 2.5 : 1.2}
          />
          {/* Anatomical cross surfaces */}
          <Polygon points="2,2 38,2 30,10 10,10" fill={cond === 'healthy' ? '#f8fafc' : fillColor} opacity={0.8} />
          <Polygon points="38,2 38,38 30,30 30,10" fill={cond === 'healthy' ? '#f1f5f9' : fillColor} opacity={0.85} />
          <Polygon points="2,38 38,38 30,30 10,30" fill={cond === 'healthy' ? '#e2e8f0' : fillColor} opacity={0.9} />
          <Polygon points="2,2 2,38 10,30 10,10" fill={cond === 'healthy' ? '#f1f5f9' : fillColor} opacity={0.85} />
          {/* Center Occlusal */}
          <Rect
            x="11"
            y="11"
            width="18"
            height="18"
            rx="3"
            fill={cond === 'healthy' ? '#ffffff' : fillColor}
            stroke="#94a3b8"
            strokeWidth={0.8}
          />
          {cond === 'missing' && (
            <Line x1="4" y1="4" x2="36" y2="36" stroke="#64748b" strokeWidth={2.5} />
          )}
        </Svg>
        <Text numberOfLines={1} style={[styles.toothCondLabel, { color: cond === 'healthy' ? '#64748b' : fillColor }]}>
          {cond === 'healthy' ? 'OK' : cond.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Legend & Condition Palette */}
      {!readOnly && (
        <View style={styles.paletteContainer}>
          <Text style={styles.sectionHeading}>CLINICAL ODONTOGRAM PALETTE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paletteScroll}>
            {(Object.keys(CONDITION_COLORS) as ToothConditionType[]).map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.paletteButton,
                  selectedCondition === c && styles.selectedPaletteButton,
                  { borderColor: CONDITION_COLORS[c] }
                ]}
                onPress={() => setSelectedCondition(c)}
              >
                <View style={[styles.paletteDot, { backgroundColor: CONDITION_COLORS[c] }]} />
                <Text style={[styles.paletteText, selectedCondition === c && styles.selectedPaletteText]}>
                  {CONDITION_LABELS[c]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Odontogram Chart */}
      <View style={styles.chartWrapper}>
        <View style={styles.archLabelRow}>
          <Text style={styles.archLabel}>UPPER MAXILLARY ARCH (18 - 28)</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.teethRow}>
          {UPPER_TEETH.map(renderSingleTooth)}
        </ScrollView>

        <View style={styles.divider} />

        <View style={styles.archLabelRow}>
          <Text style={styles.archLabel}>LOWER MANDIBULAR ARCH (48 - 38)</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.teethRow}>
          {LOWER_TEETH.map(renderSingleTooth)}
        </ScrollView>
      </View>

      {selectedToothNumber && !readOnly && onUpdateCondition && (
        <View style={styles.quickActionBox}>
          <Text style={styles.quickActionText}>
            Selected Tooth: <Text style={{ fontWeight: 'bold', color: '#0284c7' }}>#{selectedToothNumber}</Text>
          </Text>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => onUpdateCondition(selectedToothNumber, selectedCondition, ['O'])}
          >
            <Text style={styles.applyBtnText}>Apply {CONDITION_LABELS[selectedCondition]}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  paletteContainer: {
    marginBottom: 12
  },
  paletteScroll: {
    flexDirection: 'row'
  },
  paletteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
    backgroundColor: '#f8fafc'
  },
  selectedPaletteButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#0284c7'
  },
  paletteDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6
  },
  paletteText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600'
  },
  selectedPaletteText: {
    color: '#0284c7',
    fontWeight: '700'
  },
  chartWrapper: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#edf2f7'
  },
  archLabelRow: {
    alignItems: 'center',
    marginVertical: 4
  },
  archLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5
  },
  teethRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    justifyContent: 'center'
  },
  toothContainer: {
    alignItems: 'center',
    marginHorizontal: 3,
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  selectedToothBorder: {
    borderColor: '#0284c7',
    borderWidth: 2,
    backgroundColor: '#f0f9ff'
  },
  toothNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2
  },
  toothCondLabel: {
    fontSize: 8,
    fontWeight: '800',
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: '#cbd5e1',
    marginVertical: 8
  },
  quickActionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  quickActionText: {
    fontSize: 13,
    color: '#334155'
  },
  applyBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  }
});
