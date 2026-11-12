import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import JSZip from 'jszip';

const OUTPUT_DOCX_PATH = path.resolve(
  process.cwd(),
  'references/sample-assignments.docx'
);

/**
 * Pure-Node PNG encoder so the generated .docx embeds valid raster PNGs
 * without requiring native canvas dependencies.
 */
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(
  width: number,
  height: number,
  pixelFn: (x: number, y: number) => [number, number, number, number]
): Buffer {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      const idx = rowStart + 1 + x * 4;
      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(raw);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Generates Graphic 1: Content Marketing KPI Bar & Growth Chart Graphic (720x480).
 */
function createMarketingChartPng(): Buffer {
  const w = 720;
  const h = 480;
  const bars = [
    { x0: 95, x1: 165, top: 270, color: [244, 162, 140] },
    { x0: 205, x1: 275, top: 215, color: [224, 109, 83] },
    { x0: 315, x1: 385, top: 165, color: [43, 91, 78] },
    { x0: 425, x1: 495, top: 130, color: [224, 109, 83] },
    { x0: 535, x1: 605, top: 88, color: [43, 91, 78] },
  ];

  return encodePng(w, h, (x, y) => {
    // Warm Canva cream background
    let r = 250;
    let g = 245;
    let b = 238;

    // Outer white card frame
    if (x > 36 && x < w - 36 && y > 36 && y < h - 36) {
      r = 255;
      g = 255;
      b = 255;
    }
    // Top coral accent ribbon
    if (x > 36 && x < w - 36 && y > 36 && y <= 52) {
      r = 224;
      g = 109;
      b = 83;
    }
    // Horizontal chart grid lines
    if (x > 75 && x < w - 75 && [120, 180, 240, 300, 360].includes(y)) {
      r = 236;
      g = 229;
      b = 221;
    }
    // Chart baseline
    if (x > 75 && x < w - 75 && y >= 390 && y <= 393) {
      r = 60;
      g = 54;
      b = 50;
    }
    // KPI Bars
    for (const bar of bars) {
      if (x >= bar.x0 && x <= bar.x1 && y >= bar.top && y < 390) {
        [r, g, b] = bar.color;
      }
    }
    // Decorative KPI pill on top-right
    if (x >= 500 && x <= 648 && y >= 72 && y <= 106) {
      r = 235;
      g = 246;
      b = 242;
    }
    return [r, g, b, 255];
  });
}

/**
 * Generates Graphic 2: Brand & Social Media Visual Layout Mockup (720x480).
 */
function createDesignMockupPng(): Buffer {
  const w = 720;
  const h = 480;
  return encodePng(w, h, (x, y) => {
    // Matcha tint background
    let r = 239;
    let g = 246;
    let b = 243;

    // Left large editorial card
    if (x >= 48 && x <= 370 && y >= 50 && y <= 430) {
      r = 255;
      g = 255;
      b = 255;
      if (x >= 72 && x <= 346 && y >= 74 && y <= 270) {
        // Warm terracotta & coral gradient block inside mockup
        const t = (x - 72) / (346 - 72);
        r = Math.round(224 * (1 - t) + 245 * t);
        g = Math.round(109 * (1 - t) + 178 * t);
        b = Math.round(83 * (1 - t) + 138 * t);
      }
      // Skeleton text lines
      if (x >= 72 && x <= 290 && y >= 300 && y <= 316) {
        r = 36;
        g = 32;
        b = 30;
      }
      if (x >= 72 && x <= 325 && y >= 336 && y <= 348) {
        r = 165;
        g = 158;
        b = 152;
      }
      if (x >= 72 && x <= 260 && y >= 362 && y <= 374) {
        r = 165;
        g = 158;
        b = 152;
      }
    }

    // Right stacked social cards
    if (x >= 400 && x <= 672 && y >= 50 && y <= 225) {
      r = 43;
      g = 91;
      b = 78;
      if (x >= 428 && x <= 512 && y >= 82 && y <= 166) {
        r = 250;
        g = 245;
        b = 238;
      }
      if (x >= 532 && x <= 640 && y >= 94 && y <= 112) {
        r = 244;
        g = 180;
        b = 154;
      }
    }

    if (x >= 400 && x <= 672 && y >= 252 && y <= 430) {
      r = 255;
      g = 255;
      b = 255;
      if (x >= 428 && x <= 644 && y >= 282 && y <= 345) {
        r = 250;
        g = 232;
        b = 225;
      }
      if (x >= 428 && x <= 580 && y >= 368 && y <= 394) {
        r = 224;
        g = 109;
        b = 83;
      }
    }

    return [r, g, b, 255];
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function paragraphXml(text: string, style?: 'Heading1' | 'Heading2'): string {
  const pPr = style
    ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>`
    : '';
  return `<w:p>${pPr}<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function imageParagraphXml(rId: string, docPrId: number, name: string): string {
  // 5000000 x 3333333 EMU (~5.5 x 3.6 inches)
  const cx = 5000000;
  const cy = 3333333;
  return `<w:p>
  <w:r>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
        <wp:extent cx="${cx}" cy="${cy}"/>
        <wp:docPr id="${docPrId}" name="${escapeXml(name)}"/>
        <wp:cNvGraphicFramePr>
          <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
        </wp:cNvGraphicFramePr>
        <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:nvPicPr>
                <pic:cNvPr id="${docPrId}" name="${escapeXml(name)}"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>`;
}

async function generateSampleDocx() {
  const zip = new JSZip();

  const img1 = createMarketingChartPng();
  const img2 = createDesignMockupPng();

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`
  );

  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  zip.file(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rIdImg1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
  <Relationship Id="rIdImg2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image2.png"/>
</Relationships>`
  );

  zip.file(
    'word/styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:pPr><w:outlineLvl w:val="0"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="36"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:pPr><w:outlineLvl w:val="1"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="28"/></w:rPr>
  </w:style>
</w:styles>`
  );

  zip.file('word/media/image1.png', img1);
  zip.file('word/media/image2.png', img2);

  const bodyBlocks = [
    paragraphXml('HỒ SƠ BÀI TẬP THỰC HÀNH - KHÓA CONTENT & AI CREATIVE TNT LAB'),
    paragraphXml('Học viên: Từ Thị Vân Anh | Chuyên ngành: Digital Marketing & AI Content'),

    // Assignment 1 (with image1.png)
    paragraphXml('Bài tập 1: Chiến dịch Content Marketing Ra mắt Sản phẩm Trà Thảo Mộc', 'Heading1'),
    paragraphXml('Đề bài: Xây dựng kế hoạch nội dung đa kênh (Facebook, TikTok, Blog SEO) trong 30 ngày cho thương hiệu trà thảo mộc nhắm đến nhân viên văn phòng từ 22-35 tuổi.'),
    paragraphXml('Cách làm: Nghiên cứu 3 chân dung khách hàng mục tiêu, thiết kế Content Pillar gồm 40% giáo dục sức khỏe, 35% giải trí bắt trend và 25% chuyển đổi bán hàng. Ứng dụng công thức AIDA và PAS để viết 15 bài đăng và 8 kịch bản video ngắn.'),
    paragraphXml('Kết quả: Đạt 185.000 lượt tiếp cận tự nhiên sau 4 tuần, tăng +142% tỷ lệ tương tác và mang về 320 đơn hàng dùng thử đầu tiên với chi phí trên mỗi đơn hàng giảm 28%. Điểm đánh giá: 9.5/10.'),
    imageParagraphXml('rIdImg1', 1, 'Biểu đồ tăng trưởng chiến dịch Content Marketing'),

    // Assignment 2 (with image2.png)
    paragraphXml('Bài tập 2: Thiết kế Bộ Nhận diện Truyền thông & Landing Page Mùa Thu', 'Heading1'),
    paragraphXml('Đề bài: Thiết kế hệ thống ấn phẩm truyền thông Social Media (Carousel Instagram, Banner Facebook) và bố cục Landing Page đồng bộ theo phong cách Editorial tối giản.'),
    paragraphXml('Cách làm: Chọn bảng màu kem ấm (#FAF5EE), cam san hô (#E06D53) và xanh matcha (#2B5B4E). Kết hợp font chữ Playfair Display và Be Vietnam Pro để đảm bảo đọc lướt nhanh trên di động. Thiết kế 12 template tái sử dụng trên Canva và Figma.'),
    paragraphXml('Kết quả: Rút ngắn 60% thời gian sản xuất ấn phẩm hàng tuần cho đội ngũ, tỷ lệ nhấp chuột (CTR) quảng cáo đạt 4.8% vượt KPI 3.0%. Đạt giải Thiết kế ấn tượng nhất tuần.'),
    imageParagraphXml('rIdImg2', 2, 'Mockup bố cục bộ ấn phẩm truyền thông trên Canva & Figma'),

    // Assignment 3 (Text-only - no image, triggers AI Topic Image Generator)
    paragraphXml('Bài tập 3: Ứng dụng AI Prompt Engineering Tự động hóa Quy trình Nghiên cứu Thị trường', 'Heading1'),
    paragraphXml('Đề bài: Xây dựng bộ khung Prompt AI hoàn chỉnh để tự động phân tích 500 phản hồi khách hàng, rút trích insight hành vi và đề xuất ý tưởng cải tiến sản phẩm trong thời gian dưới 15 phút.'),
    paragraphXml('Cách làm: Thiết kế chuỗi Chain-of-Thought Prompt kết hợp kỹ thuật Few-shot và xuất cấu trúc JSON. Phân nhóm cảm xúc khách hàng (Tích cực, Trung lập, Khiếu nại) và tự động tạo bảng ma trận Pain Point - Giải pháp bằng ChatGPT và Gemini.'),
    paragraphXml('Kết quả: Xử lý 500 mẫu khảo sát chỉ trong 12 phút (nhanh hơn 10 lần so với phân tích thủ công), độ chính xác phân loại đạt 94%, phát hiện 3 nhóm nhu cầu chưa được khai thác giúp tăng 24% điểm hài lòng CSAT.'),
  ].join('\n');

  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${bodyBlocks}
    <w:sectPr/>
  </w:body>
</w:document>`
  );

  const outBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.mkdirSync(path.dirname(OUTPUT_DOCX_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_DOCX_PATH, outBuf);
  console.log(`Generated sample DOCX at: ${OUTPUT_DOCX_PATH} (${outBuf.length} bytes)`);
}

generateSampleDocx().catch((err) => {
  console.error(err);
  process.exit(1);
});
