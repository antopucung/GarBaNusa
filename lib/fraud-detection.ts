// AI Fraud Detection - Recommendation System (Non-Judgmental)
// Provides checklist of items to review, not automatic decisions

export interface FraudCheckItem {
  category: string;
  concern: string;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
  dataPoint: string | number;
  expectedRange?: string;
  status: 'normal' | 'review' | 'suspicious';
}

export interface FraudCheckReport {
  userId: string;
  userName: string;
  checkedAt: string;
  overallRisk: 'low' | 'medium' | 'high';
  itemsToReview: FraudCheckItem[];
  summary: string;
}

// Generate fraud detection checklist for a candidate
export function generateFraudChecklist(candidateData: any): FraudCheckReport {
  const items: FraudCheckItem[] = [];
  
  // Check 1: Training completion patterns
  const trainingCount = candidateData.actualTrainingCompleted || 0;
  if (trainingCount > 10) {
    items.push({
      category: 'Riwayat Pelatihan',
      concern: 'Jumlah pelatihan yang diselesaikan sangat tinggi',
      severity: 'medium',
      recommendation: 'Verifikasi tanggal dan durasi penyelesaian. Periksa apakah pelatihan diselesaikan dalam waktu yang realistis.',
      dataPoint: `${trainingCount} pelatihan selesai`,
      expectedRange: '1-8 pelatihan per tahun adalah normal',
      status: 'review'
    });
  } else if (trainingCount === 0) {
    items.push({
      category: 'Riwayat Pelatihan',
      concern: 'Tidak ada pelatihan yang tercatat selesai',
      severity: 'low',
      recommendation: 'Verifikasi apakah kandidat memiliki pelatihan di luar sistem atau sertifikasi eksternal.',
      dataPoint: `${trainingCount} pelatihan`,
      status: 'normal'
    });
  }

  // Check 2: Merit score alignment
  const meritScore = candidateData.meritScore || 0;
  const competencyMatch = candidateData.competencyMatch || 0;
  const performance = candidateData.performance || 0;
  
  if (meritScore > 90 && (competencyMatch < 70 || performance < 70)) {
    items.push({
      category: 'Konsistensi Skor',
      concern: 'Skor merit tinggi tetapi skor komponen rendah',
      severity: 'high',
      recommendation: 'Tinjau cara perhitungan skor merit. Verifikasi semua sumber data input.',
      dataPoint: `Merit: ${meritScore}, Kompetensi: ${competencyMatch}, Kinerja: ${performance}`,
      expectedRange: 'Komponen harus selaras dengan skor total',
      status: 'suspicious'
    });
  }

  // Check 3: Recent rapid advancement
  if (candidateData.tenure && candidateData.tenure < 3 && meritScore > 85) {
    items.push({
      category: 'Progres Karier',
      concern: 'Skor merit tinggi dengan masa kerja singkat',
      severity: 'medium',
      recommendation: 'Verifikasi pengalaman dan kualifikasi sebelumnya. Periksa keadaan khusus yang mungkin ada.',
      dataPoint: `${candidateData.tenure} tahun masa kerja, skor merit ${meritScore}`,
      expectedRange: '5+ tahun biasanya untuk skor merit 85+',
      status: 'review'
    });
  }

  // Check 4: 360 Feedback alignment
  const feedback360 = candidateData.feedback360 || 0;
  if (Math.abs(feedback360 - performance) > 20) {
    items.push({
      category: 'Konsistensi Umpan Balik',
      concern: 'Kesenjangan besar antara umpan balik 360 dan skor kinerja',
      severity: 'medium',
      recommendation: 'Tinjau sumber umpan balik. Wawancarai supervisor dan rekan kerja untuk memahami perbedaan.',
      dataPoint: `Umpan Balik 360: ${feedback360}, Kinerja: ${performance}`,
      expectedRange: 'Biasanya dalam rentang 15 poin satu sama lain',
      status: 'review'
    });
  }

  // Check 5: Learning agility score
  const learningAgility = candidateData.learningAgility || 0;
  if (learningAgility > 95) {
    items.push({
      category: 'Agilitas Belajar',
      concern: 'Skor agilitas belajar yang sangat tinggi',
      severity: 'low',
      recommendation: 'Verifikasi metode penilaian. Pertimbangkan wawancara untuk mengkonfirmasi kemampuan.',
      dataPoint: `${learningAgility}/100`,
      expectedRange: '60-85 adalah normal',
      status: 'review'
    });
  }

  // Check 6: Certificate authenticity
  if (candidateData.certificationsEarned && candidateData.certificationsEarned.length > 5) {
    items.push({
      category: 'Sertifikasi',
      concern: 'Banyak sertifikasi tercatat',
      severity: 'low',
      recommendation: 'Periksa sampel 2-3 sertifikat untuk keaslian. Verifikasi dengan lembaga penerbit.',
      dataPoint: `${candidateData.certificationsEarned.length} sertifikat`,
      status: 'review'
    });
  }

  // Check 7: Data completeness
  const hasAllData = candidateData.meritScore && 
                     candidateData.competencyMatch && 
                     candidateData.performance && 
                     candidateData.feedback360 && 
                     candidateData.learningAgility;
  
  if (!hasAllData) {
    items.push({
      category: 'Kelengkapan Data',
      concern: 'Data evaluasi kunci tidak lengkap',
      severity: 'high',
      recommendation: 'Lengkapi semua penilaian yang diperlukan sebelum membuat keputusan promosi.',
      dataPoint: 'Profil tidak lengkap',
      status: 'suspicious'
    });
  }

  // Check 8: Supervisor relationship (if available)
  if (candidateData.supervisorId) {
    items.push({
      category: 'Struktur Pelaporan',
      concern: 'Verifikasi supervisor memberikan penilaian independen',
      severity: 'low',
      recommendation: 'Wawancarai supervisor secara terpisah untuk mengkonfirmasi penilaian. Periksa konflik kepentingan.',
      dataPoint: 'Hubungan supervisor terdokumentasi',
      status: 'normal'
    });
  }

  // If no items flagged, add positive note
  if (items.length === 0) {
    items.push({
      category: 'Penilaian Keseluruhan',
      concern: 'Tidak ada anomali signifikan terdeteksi',
      severity: 'low',
      recommendation: 'Profil terlihat konsisten. Prosedur verifikasi standar berlaku.',
      dataPoint: 'Semua pemeriksaan lulus',
      status: 'normal'
    });
  }

  // Calculate overall risk
  const highSeverityCount = items.filter(i => i.severity === 'high').length;
  const mediumSeverityCount = items.filter(i => i.severity === 'medium').length;
  
  let overallRisk: 'low' | 'medium' | 'high' = 'low';
  if (highSeverityCount > 0) {
    overallRisk = 'high';
  } else if (mediumSeverityCount >= 2) {
    overallRisk = 'medium';
  }

  // Generate summary
  const summary = overallRisk === 'low' 
    ? `Profil terlihat konsisten dengan ${items.length} item untuk ditinjau sebagai prosedur standar.`
    : overallRisk === 'medium'
    ? `${mediumSeverityCount + highSeverityCount} item ditandai untuk tinjauan lebih dekat. Disarankan verifikasi tambahan.`
    : `${highSeverityCount} item prioritas tinggi terdeteksi. Disarankan investigasi menyeluruh sebelum keputusan.`;

  return {
    userId: candidateData.id,
    userName: candidateData.name,
    checkedAt: new Date().toISOString(),
    overallRisk,
    itemsToReview: items,
    summary
  };
}

// Generate unique QR code data for certificate
export function generateCertificateQRCode(params: {
  userId: string;
  trainingId: string;
  completionDate: Date;
  certificateId?: string;
}): string {
  const { userId, trainingId, completionDate, certificateId } = params;
  
  // Generate unique certificate ID if not provided
  const certId = certificateId || `GBN-${trainingId.toUpperCase()}-${userId.substring(0, 8).toUpperCase()}-${completionDate.getFullYear()}`;
  
  // Create verification URL (simulated for now)
  const verificationUrl = `https://garbanusa.vercel.app/verify/${certId}`;
  
  return verificationUrl;
}

// Generate QR code SVG (simple pattern for cosmetic purposes)
export function generateQRCodeSVG(data: string, size: number = 100): string {
  // Create a simple hash of the data for visual variation
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i);
    hash = hash & hash;
  }
  
  // Generate deterministic pattern based on hash
  const seed = Math.abs(hash);
  const gridSize = 8;
  const cellSize = size / gridSize;
  
  let squares = '';
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Use seed to determine if cell should be filled
      const cellHash = (seed + row * gridSize + col) % 3;
      if (cellHash === 0) {
        const x = col * cellSize;
        const y = row * cellSize;
        squares += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
      }
    }
  }
  
  // Create SVG with border and pattern
  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="white"/>
      ${squares}
      <rect width="${size}" height="${size}" fill="none" stroke="black" stroke-width="2"/>
    </svg>
  `;
}
