import fs from "fs";
import path from "path";
import JSZip from "jszip";
import { test, expect } from "@playwright/test";
import type { PortfolioDocument } from "@/schema/portfolio.schema";
import { resolveThemeFromContext } from "@/schema/theme.schema";

const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

function extractImgSrcs(html: string): string[] {
  return Array.from(html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)).map(
    (m) => m[1],
  );
}

test.describe("AI Portfolio Factory E2E Suite", () => {
  test("Test 1: Canva Reference Parity, Full-Page Detail, Lightbox & ZIP Export (/tuthivananhportfolio)", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    await page.goto("/tuthivananhportfolio", { waitUntil: "networkidle" });

    await expect(
      page.getByRole("heading", { name: "Từ Thị Vân Anh" }),
    ).toBeVisible();
    await expect(page.locator("#hero")).toBeVisible();
    await expect(page.locator("#about")).toBeVisible();
    await expect(page.locator("#skills")).toBeVisible();
    await expect(page.locator("#education")).toBeVisible();
    await expect(page.locator("#projects")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();

    const rootBg = await page
      .locator(".public-portfolio-print-root > div")
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(rootBg).toBe("rgb(255, 243, 230)");

    // Floating Vietnamese Section Navigation
    const floatingNav = page.getByRole("navigation", {
      name: "Điều hướng nhanh Portfolio",
    });
    await expect(floatingNav).toBeVisible();
    await expect(
      floatingNav.getByRole("link", { name: "Bìa mở đầu" }),
    ).toBeVisible();
    await expect(
      floatingNav.getByRole("link", { name: "Giới thiệu" }),
    ).toBeVisible();
    await expect(
      floatingNav.getByRole("link", { name: "Kỹ năng" }),
    ).toBeVisible();
    await expect(
      floatingNav.getByRole("link", { name: "Bài tập & Dự án tiêu biểu" }),
    ).toBeVisible();
    await expect(
      floatingNav.getByRole("link", { name: "Liên hệ" }),
    ).toBeVisible();

    await floatingNav
      .getByRole("link", { name: "Bài tập & Dự án tiêu biểu" })
      .click();

    // Ensure all rendered images loaded properly (naturalWidth > 0)
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src);
    });
    expect(brokenImages).toEqual([]);

    // Open the full-page assignment detail and test its image lightbox
    await page
      .getByRole("button", { name: /Xem trang riêng bài làm/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/tuthivananhportfolio\/projects\/[^/]+$/);
    await expect(
      page.getByRole("heading", {
        name: /Mục tiêu bài tập & Kỹ năng rèn luyện/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Quá trình thực hiện" }),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Phóng to ảnh toàn màn hình" })
      .click();
    await expect(
      page.getByRole("button", { name: "Thu nhỏ ảnh" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Thu nhỏ ảnh" }).click();
    await page.goBack();
    await expect(page).toHaveURL(/\/tuthivananhportfolio(?:#projects)?$/);

    // Verify PDF Print & ZIP Download actions
    await expect(page.getByRole("button", { name: "Xuất PDF" })).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Tải ZIP" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("tuthivananhportfolio.zip");

    const zipPath = await download.path();
    expect(zipPath).toBeTruthy();
    const zip = await JSZip.loadAsync(fs.readFileSync(zipPath!));
    expect(Object.keys(zip.files)).toContain("index.html");
    expect(Object.keys(zip.files)).toContain("assets/styles.css");
    expect(
      Object.keys(zip.files).some((name) => name.startsWith("assets/images/")),
    ).toBe(true);

    const singleHtml = await zip.file("index.html")!.async("string");
    const singleCss = await zip.file("assets/styles.css")!.async("string");
    expect(singleCss).toContain("#FFF3E6");
    expect(singleCss).toContain("#735340");
    expect(singleCss).not.toContain("canva-grid-bg");
    expect(singleCss).not.toContain("linear-gradient(to right");
    expect(singleHtml).toContain("Conclusion");
    expect(singleHtml).toContain("Thank You !");
    const singleImgSrcs = extractImgSrcs(singleHtml);
    expect(singleImgSrcs.length).toBeGreaterThanOrEqual(4);
    expect(
      singleImgSrcs.every((src) => src.startsWith("./assets/images/")),
    ).toBe(true);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("Test 2: DOCX Assignment Ingestion & Dual Image Pipeline (DOCX + AI)", async ({
    page,
  }) => {
    test.setTimeout(75_000);
    await page.goto("/studio", { waitUntil: "networkidle" });

    // Open DOCX Import Wizard
    await page
      .getByRole("button", { name: /Nhập file \.docx bài tập/i })
      .click();
    const wizard = page.getByRole("dialog");
    await expect(wizard).toBeVisible();

    // Upload real references/sample-assignments.docx + local PNG avatar (data URL)
    const sampleDocxPath = path.resolve(
      process.cwd(),
      "references/sample-assignments.docx",
    );
    expect(fs.existsSync(sampleDocxPath)).toBe(true);

    await page.getByTestId("docx-file-input").setInputFiles(sampleDocxPath);
    await page.getByTestId("avatar-file-input").setInputFiles({
      name: "student-avatar.png",
      mimeType: "image/png",
      buffer: Buffer.from(TINY_PNG_BASE64, "base64"),
    });
    await expect(page.getByTestId("avatar-preview-img")).toHaveAttribute(
      "src",
      /^data:image\/png;base64,/,
    );

    await page.getByRole("button", { name: /Tiếp tục cấu hình ảnh/i }).click();

    // Verify hybrid-auto is selected by default and start analysis
    await expect(
      wizard.locator('input[name="imageMode"][value="hybrid-auto"]'),
    ).toBeChecked();
    await page
      .getByRole("button", { name: /Phân tích & Tóm tắt Bài tập bằng AI/i })
      .click();

    // Wait for Review step (3 assignments, 2 docx images, 1 AI image)
    const assignmentsStat = wizard.getByText("Bài tập tách được").locator("..");
    await expect(assignmentsStat).toBeVisible({ timeout: 35_000 });
    await expect(assignmentsStat).toContainText("3");
    await expect(
      wizard.getByText("Ảnh lấy từ DOCX").locator(".."),
    ).toContainText("2");
    await expect(
      wizard.getByText("Ảnh AI tạo theo chủ đề").locator(".."),
    ).toContainText("1");

    await page
      .getByRole("button", { name: /Đổ vào Portfolio Canvas/i })
      .click();
    await expect(wizard).toBeHidden();

    // Verify avatar data URL rendered properly in Hero
    const heroAvatarSrc = await page
      .locator("#hero img")
      .first()
      .getAttribute("src");
    expect(heroAvatarSrc).toMatch(/^data:image\/png;base64,/);

    // Verify the 3 assignments rendered on Studio Canvas
    const projectsSection = page.locator("#projects");
    await expect(projectsSection.locator("article")).toHaveCount(3);
    await expect(
      projectsSection.getByRole("heading", {
        name: /Chiến dịch Content Marketing Ra mắt Sản phẩm Trà Thảo Mộc/i,
      }),
    ).toBeVisible();
    await expect(
      projectsSection.getByRole("heading", {
        name: /Thiết kế Bộ Nhận diện Truyền thông/i,
      }),
    ).toBeVisible();
    await expect(
      projectsSection.getByRole("heading", {
        name: /Ứng dụng AI Prompt Engineering/i,
      }),
    ).toBeVisible();

    // Verify dual image badges: 2 DOCX-extracted + 1 AI-generated
    await expect(projectsSection.getByText("📄 Ảnh từ file DOCX")).toHaveCount(
      2,
    );
    await expect(projectsSection.getByText("✨ Ảnh tạo bởi AI")).toHaveCount(1);

    // Verify actual image sources and naturalWidth > 0
    const projectImagesInfo = await projectsSection.evaluate((el) =>
      Array.from(el.querySelectorAll("img")).map((img) => ({
        src: img.getAttribute("src") || "",
        loaded: img.complete && img.naturalWidth > 0,
      })),
    );
    expect(projectImagesInfo).toHaveLength(3);
    expect(projectImagesInfo.every((info) => info.loaded)).toBe(true);
    expect(
      projectImagesInfo.filter((info) =>
        info.src.includes("/uploads/docx-media/"),
      ),
    ).toHaveLength(2);
    expect(
      projectImagesInfo.filter((info) =>
        info.src.includes("/uploads/ai-generated/"),
      ),
    ).toHaveLength(1);
  });

  test("Test 3: On-Demand AI Image Regeneration & DOCX Source Switching", async ({
    page,
  }) => {
    test.setTimeout(75_000);
    await page.goto("/studio", { waitUntil: "networkidle" });

    // Import sample-assignments.docx so project 1 has DOCX image and pool
    await page
      .getByRole("button", { name: /Nhập file \.docx bài tập/i })
      .click();
    await page
      .getByRole("button", {
        name: /Dùng file mẫu \(sample-assignments\.docx\)/i,
      })
      .click();
    await page.getByRole("button", { name: /Tiếp tục cấu hình ảnh/i }).click();
    await page
      .getByRole("button", { name: /Phân tích & Tóm tắt Bài tập bằng AI/i })
      .click();
    await expect(
      page.getByRole("button", { name: /Đổ vào Portfolio Canvas/i }),
    ).toBeVisible({ timeout: 35_000 });
    await page
      .getByRole("button", { name: /Đổ vào Portfolio Canvas/i })
      .click();

    const projectsSection = page.locator("#projects");
    const firstArticle = projectsSection.locator("article").first();
    const firstProjectImg = firstArticle.locator("img").first();
    const initialSrc = await firstProjectImg.getAttribute("src");
    expect(initialSrc).toContain("/uploads/docx-media/");

    // Trigger On-Demand AI Image Regeneration
    await firstArticle
      .getByRole("button", { name: /Tạo ảnh AI mới theo chủ đề/i })
      .click();

    await expect(async () => {
      const updatedSrc = await firstProjectImg.getAttribute("src");
      expect(updatedSrc).toBeTruthy();
      expect(updatedSrc).not.toBe(initialSrc);
      expect(updatedSrc).toContain("/uploads/ai-generated/");
      const loaded = await firstProjectImg.evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
      );
      expect(loaded).toBe(true);
    }).toPass({ timeout: 25_000 });

    await expect(firstArticle.getByText("✨ Ảnh tạo bởi AI")).toBeVisible();

    // Verify user can switch back to the preserved DOCX image
    await firstArticle
      .getByRole("button", { name: /Đổi ảnh khác trong DOCX/i })
      .click();
    await expect(firstProjectImg).toHaveAttribute(
      "src",
      /\/uploads\/docx-media\//,
    );
  });

  test("Test 4: Batch DOCX Production, Live Public Routes & Single/Bulk ZIP Asset Bundling", async ({
    page,
    request,
  }) => {
    test.setTimeout(90_000);
    await page.goto("/batch", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: /Nạp lô mẫu/i }).click();
    await page
      .getByRole("button", { name: /Chạy sản xuất hàng loạt/i })
      .click();

    await expect(
      page.getByText(/Đã xuất bản 3 trang Portfolio thành công!/i),
    ).toBeVisible({ timeout: 55_000 });

    await expect(
      page.getByRole("cell", { name: "/tuthivananhportfolio", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "/nguyenminhkhoaportfolio", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "/lehamyportfolio", exact: true }),
    ).toBeVisible();

    // Verify Bulk ZIP download directly from /batch UI
    const bulkDownloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { name: /Tải Bulk ZIP toàn bộ lớp/i })
      .click();
    const bulkDownload = await bulkDownloadPromise;
    const bulkZipPath = await bulkDownload.path();
    expect(bulkZipPath).toBeTruthy();

    const bulkZip = await JSZip.loadAsync(fs.readFileSync(bulkZipPath!));
    const bulkFileNames = Object.keys(bulkZip.files);
    for (const slug of [
      "tuthivananhportfolio",
      "nguyenminhkhoaportfolio",
      "lehamyportfolio",
    ]) {
      expect(bulkFileNames).toContain(`${slug}/index.html`);
      expect(bulkFileNames).toContain(`${slug}/assets/styles.css`);
      expect(
        bulkFileNames.some((name) => name.startsWith(`${slug}/assets/images/`)),
      ).toBe(true);
      const html = await bulkZip.file(`${slug}/index.html`)!.async("string");
      const imgSrcs = extractImgSrcs(html);
      expect(imgSrcs.length).toBeGreaterThanOrEqual(4);
      expect(imgSrcs.every((src) => src.startsWith("./assets/images/"))).toBe(
        true,
      );
    }

    // Verify newly published dynamic public portfolio route renders without broken images
    await page.goto("/nguyenminhkhoaportfolio", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: "Nguyễn Minh Khoa" }),
    ).toBeVisible();
    const publicBroken = await page.evaluate(() =>
      Array.from(document.querySelectorAll("img"))
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src),
    );
    expect(publicBroken).toEqual([]);

    // Verify single ZIP export API bundles /uploads/docx-media/, /uploads/ai-generated/, /presets/, AND data:image/png;base64,...
    const presetRes = await request.get(
      "/api/portfolios?slug=nguyenminhkhoaportfolio",
    );
    expect(presetRes.status()).toBe(200);
    const portfolioDoc = (await presetRes.json()) as PortfolioDocument;

    const docWithAllAssetTypes: PortfolioDocument = {
      ...portfolioDoc,
      sections: portfolioDoc.sections.map((sec) => {
        if (sec.type === "hero") {
          return {
            ...sec,
            avatar: {
              ...sec.avatar,
              url: `data:image/png;base64,${TINY_PNG_BASE64}`,
            },
          };
        }
        if (sec.type === "projects") {
          return {
            ...sec,
            projects: sec.projects.map((proj, idx) =>
              idx === 0
                ? {
                    ...proj,
                    media: [
                      ...proj.media,
                      {
                        id: "preset-extra",
                        url: "/presets/project-content.svg",
                        caption: "Preset visual",
                        sourceType: "user-uploaded" as const,
                      },
                    ],
                  }
                : proj,
            ),
          };
        }
        return sec;
      }),
    };

    const exportRes = await request.post("/api/export", {
      data: { document: docWithAllAssetTypes, format: "zip" },
    });
    expect(exportRes.status()).toBe(200);
    expect(exportRes.headers()["content-type"]).toContain("application/zip");

    const zipBuffer = await exportRes.body();
    const zip = await JSZip.loadAsync(zipBuffer);
    const fileNames = Object.keys(zip.files);

    expect(fileNames).toContain("index.html");
    expect(fileNames).toContain("assets/styles.css");
    const imageFiles = fileNames.filter((name) =>
      name.startsWith("assets/images/"),
    );
    expect(imageFiles.some((name) => name.endsWith("-avatar.png"))).toBe(true);
    expect(imageFiles.some((name) => name.endsWith(".svg"))).toBe(true);
    expect(imageFiles.some((name) => name.endsWith(".png"))).toBe(true);

    const indexHtml = await zip.file("index.html")!.async("string");
    const imgSrcs = extractImgSrcs(indexHtml);
    expect(imgSrcs.length).toBeGreaterThanOrEqual(5);
    expect(imgSrcs.every((src) => src.startsWith("./assets/images/"))).toBe(
      true,
    );
  });

  test("Batch file settings override defaults independently", async ({
    page,
  }) => {
    await page.goto("/batch", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Nạp tài liệu mẫu" }).click();

    const batchTemplate = page.getByLabel("Template mặc định cho cả lô");
    const fileTemplate = page.getByLabel(
      "Template cho sample-assignments.docx",
    );
    const fileLayout = page.getByLabel("Bố cục cho sample-assignments.docx");
    const fileImageStyle = page.getByLabel(
      "Phong cách ảnh cho sample-assignments.docx",
    );

    await expect(page.getByText("Tùy chỉnh từng file")).toBeVisible();
    await fileTemplate.selectOption("warm-editorial");
    await fileLayout.selectOption("projects-first");
    await fileImageStyle.selectOption("3d-render");

    await batchTemplate.selectOption("creative-bold");
    await expect(fileTemplate).toHaveValue("warm-editorial");
    await expect(fileLayout).toHaveValue("projects-first");
    await expect(fileImageStyle).toHaveValue("3d-render");
  });

  test("Test 5: Dynamic Non-Canva Theme Export, CSS Motion/Glass Parity & Context Theme Resolution", async ({
    page,
    request,
  }) => {
    const techDoc: PortfolioDocument = {
      id: "tech-ai-theme-check",
      slug: "tech-ai-engineer-demo",
      templateId: "bento-grid",
      imageGenerationConfig: {
        mode: "hybrid-auto",
        visualStyle: "3d-render",
      },
      seo: {
        title: "AI Systems Engineer Portfolio",
        description: "Demo dynamic Technology & AI theme export",
      },
      theme: {
        primaryColor: "#0284C7",
        secondaryColor: "#6366F1",
        backgroundColor: "#F0F9FF",
        surfaceColor: "#FFFFFF",
        textColor: "#0C2340",
        headingFont: "Space Grotesk",
        bodyFont: "Be Vietnam Pro",
        borderRadius: "md",
        pageTransition: "smooth-scroll",
      },
      sections: [
        {
          type: "hero",
          variant: "bento-intro",
          headline: "AI & SOFTWARE ENGINEERING",
          fullName: "Trần Quang Minh",
          roleTitle: "AI Systems Architect",
          shortBio: "Thiết kế hệ thống RAG và pipeline dữ liệu độ trễ thấp.",
          avatar: {
            url: "/presets/avatar-default.svg",
            sourceType: "user-uploaded",
            frameStyle: "rounded-rect",
            aspectRatio: "1/1",
          },
          quickTags: ["LLM Ops", "TypeScript", "Vector Search"],
          ctaButtons: [
            { label: "Xem dự án AI", href: "#projects", style: "primary" },
          ],
          decorations: [],
        },
        {
          type: "skills",
          variant: "icon-badges",
          title: "Engineering Tools",
          categories: [
            {
              name: "Core stack",
              skills: [
                { name: "TypeScript", level: 90 },
                { name: "Vector Search", level: 85 },
              ],
            },
          ],
        },
        {
          type: "projects",
          variant: "bento-projects",
          title: "Featured AI Projects",
          subtitle: "Các hệ thống ứng dụng AI thực tế",
          projects: [
            {
              id: "proj-ai-1",
              title: "Multi-Agent Document Pipeline",
              category: "Artificial Intelligence",
              assignmentBrief: "Xây dựng pipeline trích xuất dữ liệu tự động.",
              summary:
                "Giảm 65% thời gian xử lý tài liệu bằng kiến trúc agentic.",
              keyTakeaways: ["Structured JSON Schema", "Streaming Inference"],
              metrics: [{ label: "Latency", value: "< 1.2s" }],
              media: [
                {
                  id: "ai-img-1",
                  url: "/presets/project-ai.svg",
                  caption: "Architecture Overview",
                  sourceType: "ai-generated",
                },
              ],
              suggestedAiImagePrompt: "Minimalist AI pipeline 3d render",
              preferredImageStyle: "3d-render",
              links: [],
              tags: ["AI", "Pipeline"],
            },
          ],
        },
        {
          type: "contact",
          title: "Kết nối hợp tác kỹ thuật",
          subtitle: "Sẵn sàng trao đổi về kiến trúc AI và sản phẩm.",
          thankYouMessage: "THANK YOU FOR WATCHING!",
          showContactForm: false,
        },
      ],
    };

    const exportRes = await request.post("/api/export", {
      data: { document: techDoc, format: "zip" },
    });
    expect(exportRes.status()).toBe(200);
    expect(exportRes.headers()["content-type"]).toContain("application/zip");

    const zip = await JSZip.loadAsync(await exportRes.body());
    const stylesCss = await zip.file("assets/styles.css")!.async("string");
    const indexHtml = await zip.file("index.html")!.async("string");

    expect(stylesCss).toContain("--primary: #0284C7");
    expect(stylesCss).toContain("--bg: #F0F9FF");
    expect(stylesCss).toContain("@keyframes fadeInUp");
    expect(stylesCss).toContain(".reveal-on-scroll");
    expect(stylesCss).toContain(".glass-panel");
    expect(stylesCss).not.toContain("rgba(115, 83, 64");

    expect(indexHtml).toContain("IntersectionObserver");
    expect(indexHtml).toContain(".reveal-on-scroll");
    expect(indexHtml).toContain('class="pill hover-lift">TypeScript</span>');
    expect(indexHtml).not.toContain("ai-tools-declaration-table");

    // Mount standalone HTML + exported CSS into Chromium DOM to verify palette & initial reveal
    const hydratedHtml = indexHtml.replace(
      '<link rel="stylesheet" href="./assets/styles.css" />',
      `<style>${stylesCss}</style>`,
    );
    await page.setContent(hydratedHtml, { waitUntil: "domcontentloaded" });

    const renderedTheme = await page.evaluate(() => ({
      bodyBg: getComputedStyle(document.body).backgroundColor,
      heroRevealed:
        document
          .querySelector("#hero.reveal-on-scroll")
          ?.classList.contains("is-revealed") ?? false,
    }));
    expect(renderedTheme.bodyBg).toBe("rgb(240, 249, 255)");
    expect(renderedTheme.heroRevealed).toBe(true);

    // Verify context-aware theme resolution for 4 domains + Canva fallback
    const envTheme = resolveThemeFromContext([
      "Bảo tồn môi trường",
      "năng lượng xanh",
    ]);
    expect(envTheme.primaryColor).toBe("#2D6A4F");
    expect(envTheme.backgroundColor).toBe("#F2F7F4");
    expect(envTheme.headingFont).toBe("Lora");

    const aiTheme = resolveThemeFromContext([
      "AI",
      "Prompt Engineering",
      "Machine Learning",
    ]);
    expect(aiTheme.primaryColor).toBe("#0284C7");
    expect(aiTheme.secondaryColor).toBe("#6366F1");
    expect(aiTheme.backgroundColor).toBe("#F0F9FF");
    expect(aiTheme.headingFont).toBe("Space Grotesk");

    const financeTheme = resolveThemeFromContext([
      "Phân tích tài chính",
      "Chiến lược kinh doanh",
      "KPI",
    ]);
    expect(financeTheme.primaryColor).toBe("#0F766E");
    expect(financeTheme.backgroundColor).toBe("#F0FDFA");
    expect(financeTheme.headingFont).toBe("Plus Jakarta Sans");

    const healthTheme = resolveThemeFromContext([
      "Nghiên cứu y tế",
      "Chăm sóc sức khỏe",
    ]);
    expect(healthTheme.primaryColor).toBe("#0284C7");
    expect(healthTheme.secondaryColor).toBe("#0D9488");
    expect(healthTheme.backgroundColor).toBe("#F8FAFC");

    const canvaFallback = resolveThemeFromContext([
      "Chủ đề tổng hợp ngẫu nhiên không khớp từ khóa",
    ]);
    expect(canvaFallback.primaryColor).toBe("#735340");
    expect(canvaFallback.backgroundColor).toBe("#FFF3E6");
    expect(canvaFallback.headingFont).toBe("Playfair Display");
  });

  test("Test 6: Creative Canva Archetypes & Presets in Studio & Public View", async ({
    page,
  }) => {
    // 1. Visit /thu-trang (Warm Editorial archetype)
    await page.goto("/thu-trang", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: "Dương Thu Trang" }),
    ).toBeVisible();
    await expect(page.locator("#hero")).toBeVisible();
    await expect(page.locator("#about")).toBeVisible();
    await expect(page.locator("#projects")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();

    // Verify all images loaded with non-zero natural dimensions
    const brokenImagesThuTrang = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src);
    });
    expect(brokenImagesThuTrang).toEqual([]);

    // 2. Visit /hq (Creative Bold archetype)
    await page.goto("/hq", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("heading", { name: "Đinh Hồng Quyên" }),
    ).toBeVisible();
    await expect(page.getByText("Khoa học Giáo dục").first()).toBeVisible();
    await expect(page.locator("#projects")).toBeVisible();

    const brokenImagesHq = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src);
    });
    expect(brokenImagesHq).toEqual([]);

    // 3. Test Studio Template Switching
    await page.goto("/studio", { waitUntil: "networkidle" });
    const templateSelect = page.locator(
      'select[aria-label="Chọn bộ Template"]',
    );
    await expect(templateSelect).toBeVisible();

    // Switch to warm-editorial
    await templateSelect.selectOption("warm-editorial");
    await expect(templateSelect).toHaveValue("warm-editorial");

    // Switch to creative-bold
    await templateSelect.selectOption("creative-bold");
    await expect(templateSelect).toHaveValue("creative-bold");
  });

  test("Test 7: Studio Customization: In-line Direct Canvas Editing, DnD Unit Reordering & Profile Owner Manager", async ({
    page,
  }) => {
    await page.goto("/studio", { waitUntil: "networkidle" });

    // 1. In-Line Direct Canvas Text Editing on Canvas Strip
    const ownerNameTrigger = page
      .getByTestId("inline-editable-trigger")
      .first();
    await expect(ownerNameTrigger).toBeVisible();
    await ownerNameTrigger.click();

    const inlineInput = page.getByTestId("inline-editable-input");
    await expect(inlineInput).toBeVisible();
    await inlineInput.fill("Dương Thu Trang - Chuyên Gia Sư Phạm AI");
    await inlineInput.press("Enter");

    // Verify committed text is displayed
    await expect(
      page.getByTestId("inline-editable-trigger").first(),
    ).toContainText("Dương Thu Trang - Chuyên Gia Sư Phạm AI");

    // 2. Profile Owner Portrait & Frame Style Manager
    // Open Profile Owner Tab in Section Inspector
    const ownerTabBtn = page.getByRole("button", {
      name: /Chân dung Chủ nhân/i,
    });
    await expect(ownerTabBtn).toBeVisible();
    await ownerTabBtn.click();

    // Verify Frame Style and Aspect Ratio controls are visible
    const frameStyleSelect = page
      .locator("select")
      .filter({ hasText: /Canva Arch Window|Polaroid/i })
      .first();
    await expect(frameStyleSelect).toBeVisible();
    await frameStyleSelect.selectOption("polaroid");
    await expect(frameStyleSelect).toHaveValue("polaroid");

    const aspectSelect = page
      .locator("select")
      .filter({ hasText: /3:4|1:1/i })
      .first();
    await expect(aspectSelect).toBeVisible();
    await aspectSelect.selectOption("1/1");
    await expect(aspectSelect).toHaveValue("1/1");

    // 3. Section / Inner Unit Drag & Drop
    const sectionTabBtn = page.getByRole("button", {
      name: /Section đang chọn/i,
    });
    await expect(sectionTabBtn).toBeVisible();
    await sectionTabBtn.click();

    // Select Projects section
    const projectsNavRow = page.getByText(/Bài tập & Dự án/i).first();
    await projectsNavRow.click();

    const removeFirstImage = page
      .getByRole("button", { name: "Gỡ ảnh khỏi bài tập" })
      .first();
    await expect(removeFirstImage).toBeVisible();
    await removeFirstImage.click();
    await expect(
      page.getByRole("button", { name: "Gỡ tất cả ảnh khỏi bài tập" }),
    ).toBeDisabled();

    // Verify Draggable items exist in projects
    const draggableProjects = page.locator('[data-testid^="draggable-unit-"]');
    await expect(draggableProjects.first()).toBeVisible();
    const initialFirstProjectText = await draggableProjects
      .first()
      .textContent();
    expect(initialFirstProjectText).toBeTruthy();

    // Tool and skill entries can be reordered and removed from the Skills section.
    await page
      .getByLabel("Bố cục Sections và Giao diện")
      .getByText(/^\d+\. Kỹ năng \(Skills\)$/)
      .click();
    const skillRows = page.locator('[data-testid^="draggable-unit-skill-"]');
    await expect(skillRows.first()).toBeVisible();
    expect(await skillRows.count()).toBeGreaterThan(1);

    const skillCountBeforeAdd = await skillRows.count();
    const skillLevel = page
      .getByRole("slider", {
        name: /Mức độ kỹ năng/,
      })
      .first();
    const startingLevel = Number(await skillLevel.inputValue());
    await skillLevel.press("ArrowLeft");
    await expect(skillLevel).toHaveValue(
      String(Math.max(0, startingLevel - 1)),
    );

    await page.getByRole("button", { name: "Thêm kỹ năng" }).first().click();
    await expect(skillRows).toHaveCount(skillCountBeforeAdd + 1);
    await skillRows.last().getByRole("button", { name: "Xóa mục" }).click();
    await expect(skillRows).toHaveCount(skillCountBeforeAdd);

    const firstSkillName = await skillRows
      .nth(0)
      .locator('input[type="text"]')
      .inputValue();
    const secondSkillName = await skillRows
      .nth(1)
      .locator('input[type="text"]')
      .inputValue();
    const firstSkillHandle = skillRows
      .nth(0)
      .getByRole("button", { name: /^Kéo để sắp xếp:/ });
    await firstSkillHandle.scrollIntoViewIfNeeded();
    const firstSkillBox = await firstSkillHandle.boundingBox();
    const secondSkillBox = await skillRows.nth(1).boundingBox();
    if (!firstSkillBox || !secondSkillBox) {
      throw new Error("Skills list items must be visible to test dragging.");
    }
    await page.mouse.move(
      firstSkillBox.x + firstSkillBox.width / 2,
      firstSkillBox.y + firstSkillBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      secondSkillBox.x + secondSkillBox.width / 2,
      secondSkillBox.y + secondSkillBox.height / 2,
      { steps: 5 },
    );
    await page.mouse.up();

    await expect(skillRows.nth(0).locator('input[type="text"]')).toHaveValue(
      secondSkillName,
    );
    await expect(skillRows.nth(1).locator('input[type="text"]')).toHaveValue(
      firstSkillName,
    );

    const skillCount = await skillRows.count();
    await skillRows.first().getByRole("button", { name: "Xóa mục" }).click();
    await expect(skillRows).toHaveCount(skillCount - 1);
  });

  test("Test 7B: About Layout Choices Use Distinct Structures", async ({
    page,
  }) => {
    await page.goto("/studio", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Section đang chọn/i }).click();

    const sectionNavigation = page.getByLabel("Bố cục Sections và Giao diện");
    await sectionNavigation.getByText(/^\d+\. Giới thiệu \(About\)$/).click();

    const layoutContent = page.getByTestId("about-layout-content");
    const layouts = [
      { label: "Thẻ bài (Cards)", id: "cards" },
      { label: "Lưới (Grid)", id: "grid" },
      { label: "Tabs", id: "tabs" },
      { label: "Uốn lượn", id: "organic" },
      { label: "Timeline", id: "timeline" },
      { label: "2 Cột Bio", id: "two-column-bio" },
    ];
    const layoutClasses = new Set<string>();

    for (const layout of layouts) {
      await page
        .getByRole("button", { name: layout.label, exact: true })
        .click();
      await expect(layoutContent).toHaveAttribute("data-layout", layout.id);
      layoutClasses.add((await layoutContent.getAttribute("class")) ?? "");
    }

    expect(layoutClasses.size).toBe(layouts.length);
  });

  test("Test 7C: Per-section motifs, assignment layouts, and per-project image placement", async ({
    page,
  }) => {
    await page.goto("/studio", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Section đang chọn/i }).click();

    const sectionNavigation = page.getByLabel("Bố cục Sections và Giao diện");
    await sectionNavigation.getByText(/Bài tập & Dự án/).click();

    const motifSelect = page.getByLabel("Họa tiết riêng cho section");
    await motifSelect.selectOption("editorial-arcs");
    const projectsSection = page.locator('[data-section-type="projects"]');
    await expect(projectsSection).toHaveAttribute(
      "data-section-motif",
      "editorial-arcs",
    );
    await expect(
      projectsSection.locator(':scope > [aria-hidden="true"]'),
    ).toHaveCount(1);
    await page
      .getByLabel("Hashtag riêng cho section")
      .fill("portfolio, #ai tools");
    await expect(projectsSection).toContainText("#portfolio");
    await expect(projectsSection).toContainText("#ai-tools");
    await page.getByLabel("Font tiêu đề").selectOption("Lora");
    await page.getByLabel("Font nội dung").selectOption("Space Grotesk");
    const sectionFonts = await projectsSection.evaluate((element) => ({
      heading: getComputedStyle(element).getPropertyValue("--font-heading"),
      body: getComputedStyle(element).fontFamily,
    }));
    expect(sectionFonts.heading).toContain("Lora");
    expect(sectionFonts.body).toContain("Space Grotesk");

    const mediaPositionSelect = page.getByLabel("Vị trí ảnh trong bài tập");
    const firstProject = page.locator("#projects article").first();
    for (const position of ["left", "right", "top", "bottom"]) {
      await mediaPositionSelect.selectOption(position);
      await expect(firstProject).toHaveAttribute(
        "data-project-media-position",
        position,
      );
      const mediaContent = firstProject.locator(
        '[data-project-content="media"]',
      );
      const detailsContent = firstProject.locator(
        '[data-project-content="details"]',
      );
      const mediaFirst = position === "left" || position === "top";
      await expect(mediaContent).toHaveClass(
        mediaFirst ? /order-1/ : /order-2/,
      );
      await expect(detailsContent).toHaveClass(
        mediaFirst ? /order-2/ : /order-1/,
      );
      if (position === "top" || position === "bottom") {
        await expect(mediaContent).toHaveClass(/lg:col-span-12/);
        await expect(detailsContent).toHaveClass(/lg:col-span-12/);
      }
    }
    await mediaPositionSelect.selectOption("left");
    await page
      .getByRole("textbox", { name: "Kết quả và điểm nhấn 1" })
      .fill("Hoàn thành mục tiêu và rút ra bài học thực tiễn.");
    await expect(firstProject).toContainText(
      "Hoàn thành mục tiêu và rút ra bài học thực tiễn.",
    );
    await page
      .getByRole("button", { name: "Thêm kết quả và điểm nhấn" })
      .click();
    const takeawayCount = await page
      .getByRole("textbox", { name: /^Kết quả và điểm nhấn \d+$/ })
      .count();
    const addedTakeaway = page.getByRole("textbox", {
      name: `Kết quả và điểm nhấn ${takeawayCount}`,
    });
    await addedTakeaway.fill("Kỹ năng được củng cố.");
    await expect(firstProject).toContainText("Kỹ năng được củng cố.");
    await page
      .getByRole("button", {
        name: `Xóa kết quả và điểm nhấn ${takeawayCount}`,
      })
      .click();
    await expect(addedTakeaway).toHaveCount(0);
    await page
      .getByLabel("Liên kết tới file DOCX")
      .fill("https://example.com/Bai_02_Tim_Kiem_Hoc_Thuat.docx");
    const docxLink = page.getByRole("link", {
      name: "Mở file DOCX đính kèm",
    });
    await expect(docxLink.first()).toHaveAttribute(
      "href",
      "https://example.com/Bai_02_Tim_Kiem_Hoc_Thuat.docx",
    );

    await page.getByRole("button", { name: "Masonry gallery" }).click();
    await expect(firstProject).toHaveClass(/lg:col-span-7/);
    await page.getByRole("button", { name: "Case study cards" }).click();
    await expect(firstProject).toHaveClass(/md:grid-cols-12/);

    await sectionNavigation.getByText(/Liên hệ \(Contact\)/).click();
    const contactDescription =
      "Công nghệ và AI mở rộng sáng tạo, con người định hướng giáo dục.";
    await page.getByLabel("Mô tả Contact").fill(contactDescription);
    await expect(page.locator("#contact")).toContainText(contactDescription);
    const footerName = "Tên chân trang tùy chỉnh";
    await page.getByLabel("Tên hiển thị ở chân trang").fill(footerName);
    await page.getByLabel("Vị trí tên ở chân trang").selectOption("center");
    const industryTitle = "Sinh viên ngành Thiết kế sáng tạo";
    await page.getByLabel("Ngành / chức danh hiển thị").fill(industryTitle);
    await expect(page.locator("#contact")).toContainText(industryTitle);
    const courseFooter = page.getByTestId("rubric-course-footer");
    await expect(courseFooter).toContainText(footerName);
    await expect(page.locator("nav")).toContainText(footerName);
    await expect(courseFooter.locator(":scope > div > div").first()).toHaveCSS(
      "justify-content",
      "center",
    );
    const footerWidget = page.getByRole("button", {
      name: "Footer Widget",
      exact: true,
    });
    await footerWidget.click();
    await expect(footerWidget).toHaveClass(/border-amber-600/);

    await sectionNavigation.getByText(/Bìa mở đầu \(Hero\)/).click();
    const editorialHeader = page.getByRole("button", {
      name: "Editorial",
      exact: true,
    });
    await editorialHeader.click();
    await expect(editorialHeader).toHaveClass(/border-amber-600/);
  });

  test("Projects section title updates its heading and navigation label", async ({
    page,
  }) => {
    await page.goto("/studio", { waitUntil: "networkidle" });
    const projectsSection = page.locator('[data-section-type="projects"]');
    await projectsSection.click();

    const customTitle = "Bài tập thực hành đã chọn";
    await page.locator("#projects-section-title").fill(customTitle);
    await expect(projectsSection).toContainText(customTitle);
    await expect(
      page.locator("nav").getByRole("link", { name: customTitle }),
    ).toBeVisible();
  });

  test("Contact email is editable and updates its displayed mail link", async ({
    page,
  }) => {
    await page.goto("/studio", { waitUntil: "networkidle" });
    const contactSection = page.locator('[data-section-type="contact"]');
    await contactSection.click();

    const email = "hello@example.com";
    await page.getByLabel("Email liên hệ").fill(email);
    await expect(
      contactSection.locator('a[href^="mailto:"]').first(),
    ).toHaveAttribute("href", `mailto:${email}`);
    await expect(contactSection).toContainText(email);
  });

  test("Project tags can be edited, added, and removed", async ({ page }) => {
    await page.goto("/studio", { waitUntil: "networkidle" });
    const projectsSection = page.locator('[data-section-type="projects"]');
    await projectsSection.click();

    const firstProject = page.locator("#projects article").first();
    const firstTag = page.getByRole("textbox", {
      name: "Tag bài tập 1",
      exact: true,
    });
    await firstTag.fill("Tag có thể chỉnh sửa");
    await expect(firstProject).toContainText("Tag có thể chỉnh sửa");

    const existingTagCount = await page
      .getByRole("textbox", { name: /^Tag bài tập \d+$/ })
      .count();
    await page.getByRole("button", { name: "Thêm tag bài tập" }).click();
    const addedTag = page.getByRole("textbox", {
      name: `Tag bài tập ${existingTagCount + 1}`,
      exact: true,
    });
    await addedTag.fill("Tag mới");
    await expect(firstProject).toContainText("Tag mới");

    await page
      .getByRole("button", { name: `Xóa tag bài tập ${existingTagCount + 1}` })
      .click();
    await expect(addedTag).toHaveCount(0);
    await expect(firstProject).not.toContainText("Tag mới");
  });

  test("Project information chips can be edited, added, and removed", async ({
    page,
  }) => {
    await page.goto("/studio", { waitUntil: "networkidle" });
    const projectsSection = page.locator('[data-section-type="projects"]');
    await projectsSection.click();
    const firstProject = page.locator("#projects article").first();

    const metricCount = await page
      .getByRole("textbox", { name: /^Tên thẻ thông tin \d+$/ })
      .count();
    await page
      .getByRole("button", { name: "Thêm thẻ thông tin bài tập" })
      .click();
    const metricLabel = page.getByRole("textbox", {
      name: `Tên thẻ thông tin ${metricCount + 1}`,
      exact: true,
    });
    const metricValue = page.getByRole("textbox", {
      name: `Giá trị thẻ thông tin ${metricCount + 1}`,
      exact: true,
    });
    await metricLabel.fill("Thẻ thử nghiệm");
    await metricValue.fill("Nội dung kiểm tra");
    await expect(firstProject).toContainText(
      "Thẻ thử nghiệm: Nội dung kiểm tra",
    );

    await page
      .getByRole("button", {
        name: `Xóa thẻ thông tin ${metricCount + 1}`,
      })
      .click();
    await expect(metricLabel).toHaveCount(0);
    await expect(firstProject).not.toContainText(
      "Thẻ thử nghiệm: Nội dung kiểm tra",
    );
  });

  test("Hero tags and About cards are directly editable, resizable, and freely positioned", async ({
    page,
  }) => {
    await page.goto("/studio", { waitUntil: "networkidle" });
    await page.getByLabel("Chọn bộ Template").selectOption("bento-grid");

    const sectionNavigation = page.getByLabel("Bố cục Sections và Giao diện");
    await sectionNavigation.getByText(/Bìa mở đầu \(Hero\)/).click();

    const existingHeroTags = page.locator(
      '#hero [data-testid="hero-quick-tag"]',
    );
    const existingTagCount = await existingHeroTags.count();
    const firstHeroTag = page.getByLabel("Tag nhỏ 1");
    await firstHeroTag.fill("Sư phạm Âm nhạc & AI");
    await expect(existingHeroTags.first()).toContainText(
      "Sư phạm Âm nhạc & AI",
    );

    await page.getByRole("button", { name: "Thêm tag nhỏ" }).click();
    const addedTag = page.getByLabel(`Tag nhỏ ${existingTagCount + 1}`);
    await addedTag.fill("Nghiên cứu âm nhạc");
    await expect(existingHeroTags.last()).toContainText("Nghiên cứu âm nhạc");
    await page
      .getByRole("button", {
        name: `Xóa tag nhỏ số ${existingTagCount + 1}`,
      })
      .click();
    await expect(existingHeroTags).toHaveCount(existingTagCount);

    await page.getByRole("button", { name: "Thêm tag Hero" }).click();
    await expect(existingHeroTags).toHaveCount(existingTagCount + 1);
    await page
      .getByRole("button", { name: `Xóa tag Hero ${existingTagCount + 1}` })
      .click();
    await expect(existingHeroTags).toHaveCount(existingTagCount);

    const canvasTag = page.getByLabel("Sửa tag Hero 1");
    await canvasTag.fill("Sư phạm Âm nhạc số");
    await canvasTag.press("Tab");
    await expect(page.getByLabel("Tag nhỏ 1")).toHaveValue(
      "Sư phạm Âm nhạc số",
    );

    await sectionNavigation.getByText(/Giới thiệu \(About\)/).click();
    const aboutIntro = page.getByTestId("about-intro-layout");
    await page.getByLabel("Mẫu khung các ô About").selectOption("glass");
    const aboutCardSurface = page
      .locator('#about [data-about-frame="glass"]')
      .first();
    await expect(aboutCardSurface).toBeVisible();
    await page.getByLabel("Font tiêu đề ô About").selectOption("Lora");
    await page.getByLabel("Font nội dung ô About").selectOption("Merriweather");
    await expect(aboutCardSurface.locator("h4").first()).toHaveCSS(
      "font-family",
      /Lora/,
    );
    await expect(aboutCardSurface).toHaveCSS("font-family", /Merriweather/);

    const creativeLayouts = [
      { label: "Editorial Poster", key: "editorial-poster" },
      { label: "Profile Dashboard", key: "profile-dashboard" },
      { label: "Spotlight Profile", key: "spotlight" },
    ];
    const layoutStructures = new Set<string>();
    for (const layout of creativeLayouts) {
      await page.getByRole("button", { name: layout.label }).click();
      await expect(aboutIntro).toHaveAttribute("data-layout", layout.key);
      layoutStructures.add(
        await aboutIntro.evaluate((element) =>
          Array.from(element.children)
            .map((child) => child.className)
            .join("|"),
        ),
      );
    }
    expect(layoutStructures.size).toBe(creativeLayouts.length);
    await page.getByRole("button", { name: "Editorial Poster" }).click();

    const aboutCards = page.getByTestId("about-layout-content");
    const contactCard = page.getByTestId("about-card-contact");
    await page.getByRole("button", { name: "Mở rộng ô contact" }).click();
    await expect(aboutCards).toHaveAttribute("data-layout-positioning", "free");
    await expect(contactCard).toHaveAttribute("style", /span 8/);
    await page.getByRole("button", { name: "Kéo dài ô contact" }).click();
    await expect(contactCard).toHaveAttribute("style", /min-height: 496px/);

    const email = page.getByRole("textbox", {
      name: "Email trong ô liên hệ",
    });
    await email.fill("studio-edited@example.com");
    await email.press("Tab");
    await expect(contactCard).toContainText("studio-edited@example.com");

    const highlight = page.getByTestId("about-highlight-0");
    await page.getByRole("button", { name: "Mở rộng điểm nổi bật 1" }).click();
    await expect(highlight).toHaveAttribute("data-highlight-width", "2");
    await page.getByRole("button", { name: "Kéo dài điểm nổi bật 1" }).click();
    await expect(highlight).toHaveAttribute("style", /grid-row: span 2/);

    await aboutCards.scrollIntoViewIfNeeded();
    const gridBox = await aboutCards.boundingBox();
    const handleBox = await page
      .getByRole("button", { name: "Kéo ô contact đến vị trí khác" })
      .boundingBox();
    expect(gridBox).toBeTruthy();
    expect(handleBox).toBeTruthy();
    const beforeDrag = await contactCard.getAttribute("style");
    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      gridBox!.x + gridBox!.width * 0.1,
      gridBox!.y + gridBox!.height * 0.8,
      { steps: 8 },
    );
    await page.mouse.up();
    await expect(contactCard).not.toHaveAttribute("style", beforeDrag ?? "");
  });

  test("Mobile portfolio action docks do not overlap each other or the page width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/tuthivananhportfolio", { waitUntil: "networkidle" });

    const menuButton = page.getByRole("button", {
      name: "Mở mục lục điều hướng",
    });
    const zipButton = page.getByRole("button", { name: "Tải ZIP" });
    await expect(menuButton).toBeVisible();
    await expect(page.getByRole("button", { name: "Xuất PDF" })).toBeVisible();
    await expect(zipButton).toBeVisible();

    const menuBounds = await menuButton.boundingBox();
    const actionDockBounds = await zipButton.locator("xpath=..").boundingBox();
    if (!menuBounds || !actionDockBounds) {
      throw new Error(
        "Mobile portfolio navigation and action docks must be visible.",
      );
    }

    const docksOverlap =
      menuBounds.x < actionDockBounds.x + actionDockBounds.width &&
      menuBounds.x + menuBounds.width > actionDockBounds.x &&
      menuBounds.y < actionDockBounds.y + actionDockBounds.height &&
      menuBounds.y + menuBounds.height > actionDockBounds.y;
    expect(docksOverlap).toBe(false);

    await menuButton.click();
    await expect(
      page.getByRole("link", { name: "Bài tập & Dự án tiêu biểu" }),
    ).toBeVisible();

    const sectionNavigation = page.getByTestId("portfolio-section-navigation");
    const navigationBounds = await sectionNavigation.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(navigationBounds.scrollWidth).toBeLessThanOrEqual(
      navigationBounds.clientWidth,
    );

    const pageWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(pageWidth).toBeLessThanOrEqual(390);
  });

  test("Test 8: Project Details Open as Full-Page Routes with Next/Prev Navigation", async ({
    page,
  }) => {
    // 1. Dedicated Route Mode: /thu-trang/projects/quan-tri-tep-hoc-thuat
    await page.goto("/thu-trang/projects/quan-tri-tep-hoc-thuat", {
      waitUntil: "networkidle",
    });

    // Verify header, chapter badge, and project title
    await expect(
      page.getByRole("heading", {
        name: /01\. Làm chủ File Explorer & Tìm kiếm Học thuật/i,
      }),
    ).toBeVisible();
    await expect(page.getByText(/Chương 1/i).first()).toBeVisible();
    await expect(page.getByText(/Bài tập 1/i).first()).toBeVisible();

    // Verify Breadcrumb
    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumb).toBeVisible();

    // Navigate to next project via 'Bài tiếp theo ›'
    const nextBtn = page.getByRole("link", { name: "Bài tiếp theo ›" });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Expect navigation to project 2
    await expect(page).toHaveURL(/thiet-ke-prompt-ai-su-pham/);
    await expect(
      page.getByRole("heading", {
        name: /02\. Kỹ thuật Viết Prompt AI Đa tầng/i,
      }),
    ).toBeVisible();

    // Keyboard navigation: ArrowLeft navigates back to project 1
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/quan-tri-tep-hoc-thuat/);
    await expect(
      page.getByRole("heading", {
        name: /01\. Làm chủ File Explorer/i,
      }),
    ).toBeVisible();

    // Keyboard navigation: Escape navigates back to portfolio projects section
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/thu-trang#projects/);

    // 2. Default project details open as a normal, scrollable page
    await page.goto("/tuthivananhportfolio", { waitUntil: "networkidle" });
    const viewDetailBtn = page
      .getByRole("button", { name: /Xem trang riêng bài làm/i })
      .first();
    await viewDetailBtn.click();

    await expect(page).toHaveURL(/\/tuthivananhportfolio\/projects\/[^/]+$/);
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Liêm chính học thuật/i }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", {
        name: /Công cụ AI & Mục đích ứng dụng trong bài tập/i,
      }),
    ).toHaveCount(0);
    await page.evaluate(() =>
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      }),
    );
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(0);
  });

  test("Test 9: Visual Effects & Background Illustration Engine in Public View & Static ZIP Export", async ({
    page,
    request,
  }) => {
    // 1. Verify Visual Effects and Background Preset on /thu-trang
    await page.goto("/thu-trang", { waitUntil: "networkidle" });

    const visualEffects = page.getByTestId("portfolio-visual-effects");
    await expect(visualEffects).toBeVisible();
    await expect(visualEffects).toHaveCSS("position", "absolute");

    // Check that floating ambient orbs or sparkles exist
    const hasEffectsLayer = await page.evaluate(() => {
      return Boolean(
        document.querySelector(".animate-float") ||
        document.querySelector('[class*="pointer-events-none fixed inset-0"]'),
      );
    });
    expect(hasEffectsLayer).toBe(true);

    // 2. Test Custom Background Upload & Visual Effects Sync in ZIP Export
    const customDoc: PortfolioDocument = {
      id: "custom-effects-bg-test",
      slug: "custom-effects-demo",
      templateId: "warm-editorial",
      imageGenerationConfig: {
        mode: "hybrid-auto",
        visualStyle: "editorial-illustration",
      },
      seo: {
        title: "Custom Effects & Background Portfolio",
        description: "Verifying effects and custom background bundle",
      },
      theme: {
        primaryColor: "#326586",
        secondaryColor: "#F4E9D4",
        backgroundColor: "#F0EFE2",
        surfaceColor: "#FFFFFF",
        textColor: "#1C1412",
        headingFont: "Playfair Display",
        bodyFont: "Be Vietnam Pro",
        borderRadius: "lg",
        pageTransition: "slide-deck",
        effects: {
          enableFloat: true,
          enableGlow: true,
          enableTilt: true,
          enableSparkles: true,
          revealVariant: "slide-left",
          enableParallax: true,
        },
        backgroundIllustration: {
          mode: "custom",
          presetId: "none",
          customUrl: `data:image/png;base64,${TINY_PNG_BASE64}`,
          opacity: 0.2,
          blur: 0,
          position: "cover",
        },
      },
      sections: [
        {
          type: "hero",
          headingFont: "Lora",
          bodyFont: "Merriweather",
          tags: ["hero", "portfolio"],
          variant: "canva-cover",
          headline: "Digital Showcase",
          fullName: "Trần Minh Khang",
          roleTitle: "Học viên Sư phạm Số",
          shortBio: "Kiểm thử visual effects và background engine.",
          avatar: {
            url: `data:image/png;base64,${TINY_PNG_BASE64}`,
            sourceType: "user-uploaded",
            frameStyle: "arch-window",
            aspectRatio: "3/4",
          },
          quickTags: ["AI", "Visual Effects"],
          ctaButtons: [
            { label: "Khám phá", href: "#projects", style: "primary" },
          ],
          decorations: [],
        },
        {
          type: "about",
          variant: "editorial-poster",
          title: "Giới thiệu",
          biography: "Đoạn giới thiệu thử nghiệm.",
          highlights: [
            { label: "Học vấn", value: "Đại học", width: 3, height: 2 },
          ],
          contactInfo: {
            email: "hello@example.com",
            socials: [],
          },
          cardPositions: {
            contact: { column: 0, row: 0, width: 6, height: 5 },
            education: { column: 6, row: 0, width: 6, height: 3 },
            learningGoals: { column: 6, row: 3, width: 6, height: 4 },
          },
          cardFrame: "glass",
          cardHeadingFont: "Lora",
          cardBodyFont: "Merriweather",
          cardTitles: { contact: "Liên hệ tùy chỉnh" },
          educationSchool: "Đại học thử nghiệm",
          educationDegree: "Sư phạm số",
          educationPeriod: "2024–2026",
          learningGoals: "Mục tiêu tùy chỉnh.",
        },
        {
          type: "projects",
          tags: ["coursework"],
          variant: "canva-slide-showcase",
          title: "Bài tập Thực hành",
          subtitle: "Dự án số",
          detailViewMode: "dedicated-route",
          navigationLoop: true,
          projects: [
            {
              id: "p-effect-1",
              slug: "bai-tap-hieu-ung",
              title: "Bài tập 01: Sáng tạo Hiệu ứng",
              category: "Đồ họa",
              docxUrl: "https://example.com/assignment.docx",
              chapterTitle: "Chương 1",
              exerciseNumber: "Bài 1",
              assignmentBrief: "Tạo hiệu ứng thị giác.",
              summary: "Quá trình thực hiện hoàn chỉnh.",
              mediaPosition: "bottom",
              keyTakeaways: ["Kết quả đã kiểm chứng: Keyframe animation"],
              metrics: [],
              media: [
                {
                  id: "m-effect-1",
                  url: `data:image/png;base64,${TINY_PNG_BASE64}`,
                  caption: "Hình ảnh bài nộp",
                  sourceType: "user-uploaded",
                },
              ],
              suggestedAiImagePrompt: "Visual effects test",
              preferredImageStyle: "editorial-illustration",
              links: [],
              tags: ["Effects"],
            },
          ],
        },
        {
          type: "contact",
          bodyFont: "Space Grotesk",
          tags: ["contact"],
          title: "Kết luận",
          subtitle: "Hoàn tất kiểm thử",
          thankYouMessage: "THANK YOU !",
          showContactForm: false,
        },
      ],
    };

    const exportRes = await request.post("/api/export", {
      data: { document: customDoc, format: "zip" },
    });
    expect(exportRes.status()).toBe(200);

    const zip = await JSZip.loadAsync(await exportRes.body());
    const fileNames = Object.keys(zip.files);

    expect(fileNames).toContain("index.html");
    expect(fileNames).toContain("assets/styles.css");
    // Standalone project page bundled in ZIP
    expect(fileNames).toContain("projects/project-1.html");
    expect(fileNames).toContain("projects/bai-tap-hieu-ung.html");
    const standaloneProjectHtml = await zip
      .file("projects/project-1.html")!
      .async("string");
    expect(standaloneProjectHtml).not.toContain("Liêm chính học thuật");
    expect(standaloneProjectHtml).not.toContain(
      "Công cụ AI &amp; Mục đích ứng dụng",
    );
    expect(standaloneProjectHtml).toContain(
      "https://example.com/assignment.docx",
    );
    expect(standaloneProjectHtml).toContain(
      "Kết quả đã kiểm chứng: Keyframe animation",
    );

    const cssContent = await zip.file("assets/styles.css")!.async("string");
    expect(cssContent).toContain("@keyframes float");
    expect(cssContent).toContain("@keyframes sparklePulse");
    expect(cssContent).toContain("::-webkit-scrollbar-thumb");

    const indexHtml = await zip.file("index.html")!.async("string");
    expect(indexHtml).toContain("bg-illustration");
    expect(indexHtml).toContain("--section-heading-font:");
    expect(indexHtml).toContain("--section-body-font:");
    expect(indexHtml).toContain("'Merriweather', Georgia, serif");
    expect(indexHtml).toContain("'Space Grotesk', sans-serif");
    expect(indexHtml).toContain('data-effect-tilt="enabled"');
    expect(indexHtml).toContain('data-effect-glow="enabled"');
    expect(indexHtml).toContain('data-effect-parallax="enabled"');
    expect(indexHtml).toContain('data-effect-float="enabled"');
    expect(indexHtml).toContain('data-effect-sparkles="enabled"');
    expect(indexHtml).toContain('data-reveal-variant="slide-left"');
    expect(indexHtml).toContain('class="portfolio-export-effects"');
    expect(cssContent).toContain(
      '.portfolio-export-root[data-effect-tilt="enabled"]',
    );
    expect(indexHtml).toContain("#hero");
    expect(indexHtml).toContain("#coursework");
    expect(indexHtml).toContain('data-about-layout="editorial-poster"');
    expect(indexHtml).toContain('data-about-card="contact"');
    expect(indexHtml).toContain('data-about-frame="glass"');
    expect(indexHtml).toContain('data-project-media-position="bottom"');
    expect(indexHtml).toContain("Kết quả đã kiểm chứng: Keyframe animation");
    expect(indexHtml).toContain("--about-card-heading-font:&#39;Lora&#39;");
    expect(indexHtml).toContain(
      "--about-card-body-font:&#39;Merriweather&#39;",
    );
    expect(indexHtml).toContain("grid-column:1 / span 6;grid-row:1 / span 5;");
    expect(indexHtml).toContain('data-highlight-width="3"');
    expect(indexHtml).toContain('style="grid-row:span 2;min-height:176px;"');
    expect(indexHtml).toContain("Liên hệ tùy chỉnh");
    expect(indexHtml).toContain("Đại học thử nghiệm");
  });

  test("About highlight values scroll only when they overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 414, height: 900 });
    await page.goto("/tuthivananhportfolio", { waitUntil: "networkidle" });

    const aboutSection = page.locator("#about");
    const longValue = aboutSection.getByText("Sư phạm Âm nhạc", {
      exact: true,
    });
    const shortValue = aboutSection.getByText("2026 Edition", { exact: true });

    await expect(longValue).toHaveClass(/is-overflowing/);
    await expect(longValue).toHaveCSS(
      "animation-name",
      "aboutHighlightMarquee",
    );
    await expect(shortValue).not.toHaveClass(/is-overflowing/);
    await expect(shortValue).not.toHaveCSS(
      "animation-name",
      "aboutHighlightMarquee",
    );
  });

  test("Visual effect controls apply motion and glow inside the portfolio canvas", async ({
    page,
  }) => {
    await page.goto("/studio", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Hiệu ứng", exact: true }).click();

    const portfolio = page.locator("[data-effect-tilt]").first();
    const aboutCard = page
      .locator('[data-section-type="about"] [data-about-frame]')
      .first();
    await expect(portfolio).toBeVisible();
    await expect(aboutCard).toBeVisible();

    await page.getByLabel(/Lơ lửng bồng bềnh/).check();
    await expect(portfolio).toHaveAttribute("data-effect-float", "enabled");
    await expect(portfolio.locator(".animate-float")).toHaveCount(3);

    await page.getByLabel(/Lấp lánh tinh tú/).check();
    await expect(portfolio).toHaveAttribute("data-effect-sparkles", "enabled");
    await expect(portfolio.locator(".sparkle-particles")).toHaveCount(6);

    await page.getByLabel(/Nghiêng 3D tương tác chuột/).check();
    await expect(portfolio).toHaveAttribute("data-effect-tilt", "enabled");
    await aboutCard.scrollIntoViewIfNeeded();
    await aboutCard.hover();
    await expect
      .poll(() =>
        aboutCard.evaluate((element) => getComputedStyle(element).transform),
      )
      .not.toBe("none");

    await page.getByLabel(/Hào quang phát sáng/).check();
    await expect(portfolio).toHaveAttribute("data-effect-glow", "enabled");
    await expect
      .poll(() =>
        aboutCard.evaluate((element) => getComputedStyle(element).boxShadow),
      )
      .not.toBe("none");

    await page.getByLabel(/Thị sai chiều sâu/).check();
    await expect(portfolio).toHaveAttribute("data-effect-parallax", "enabled");
    await portfolio.evaluate((element) => {
      const scrollContainer = element.closest("main");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    });
    await expect
      .poll(() =>
        portfolio.evaluate((element) =>
          element.style.getPropertyValue("--portfolio-parallax-offset"),
        ),
      )
      .not.toBe("0px");
    await page
      .getByLabel("Hiệu ứng xuất hiện khi cuộn")
      .selectOption("slide-left");
    await expect(portfolio).toHaveAttribute(
      "data-reveal-variant",
      "slide-left",
    );
    await expect(portfolio.locator("#about")).toHaveClass(/reveal-slide-left/);
  });

  test("Test 10: About Goals, 3 Project Components, Prompt Comparison & Course Footer", async ({
    page,
  }) => {
    // 1. Check About section on /thu-trang for INF2501 learning goals.
    await page.goto("/thu-trang", { waitUntil: "networkidle" });

    const aboutSection = page.locator("#about");
    await expect(aboutSection).toBeVisible();
    await expect(page.locator("#skills .hover-lift").first()).toHaveClass(
      /hover-lift/,
    );

    // Learning Goals & Portfolio Objective
    await expect(
      aboutSection.getByText("Mục tiêu học tập & phát triển"),
    ).toBeVisible();
    await expect(
      aboutSection.getByText("Mục tiêu của Portfolio"),
    ).toBeVisible();

    await expect(
      aboutSection.getByText(/Video giới thiệu bản thân|Video intro/i),
    ).toHaveCount(0);

    // 2. Check Project Detail 3 Required Components on /thu-trang/projects/thiet-ke-prompt-ai-su-pham
    await page.goto("/thu-trang/projects/thiet-ke-prompt-ai-su-pham", {
      waitUntil: "networkidle",
    });

    // Component (a): Mục tiêu bài tập (Assignment Brief)
    await expect(
      page.getByText(/Yêu cầu đề bài \(Assignment Brief\)/i),
    ).toBeVisible();
    await expect(
      page.getByText(/Kỹ năng cốt lõi & Kết quả kỳ vọng/i),
    ).toBeVisible();

    // Component (b): Quá trình thực hiện, without AI or integrity declarations
    await expect(
      page.getByRole("heading", {
        name: "Quá trình thực hiện",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Liêm chính học thuật/i }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("heading", {
        name: /Công cụ AI & Mục đích ứng dụng trong bài tập/i,
      }),
    ).toHaveCount(0);

    // Component (c): Sản phẩm cuối cùng & Minh chứng bài làm
    await expect(
      page.getByRole("heading", {
        name: /Sản phẩm cuối cùng & Minh chứng bài làm/i,
      }),
    ).toBeVisible();

    // Specialized Artifact: Prompt Comparison Viewer
    await expect(
      page.getByText("So sánh Prompt ban đầu vs Prompt cải tiến"),
    ).toBeVisible();
    await expect(
      page.getByText("1. Prompt ban đầu (Initial Prompt):"),
    ).toBeVisible();
    await expect(
      page.getByText("2. Prompt cải tiến (Improved Prompt):"),
    ).toBeVisible();
    await expect(page.getByText("3. Kết quả AI đạt được:")).toBeVisible();

    // 3. The portfolio omits the AI declaration and keeps the course footer.
    await page.goto("/thu-trang", { waitUntil: "networkidle" });
    await expect(
      page.locator('[data-testid="ai-tools-declaration-table"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('iframe[src*="youtube"], a[href*="youtube"]'),
    ).toHaveCount(0);
    await expect(
      page.getByText(/Video giới thiệu bản thân|Video intro/i),
    ).toHaveCount(0);

    const contactSection = page.locator("#contact");
    await expect(contactSection).toBeVisible();
    await expect(
      contactSection.locator(
        '[data-testid="ai-tools-declaration-table"], iframe[src*="youtube"], a[href*="youtube"]',
      ),
    ).toHaveCount(0);

    // Course Footer
    const courseFooter = page.locator('[data-testid="rubric-course-footer"]');
    await expect(courseFooter).toBeVisible();
    await expect(courseFooter.getByText("Dương Thu Trang")).toBeVisible();
    await expect(courseFooter.getByText(/MSSV:\s*725102088/)).toBeVisible();
    await expect(courseFooter.getByText(/INF2501/)).toBeVisible();
  });
});
