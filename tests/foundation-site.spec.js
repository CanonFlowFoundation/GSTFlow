// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('CanonFlow Foundation Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/foundation/');
  });

  // ---- Core Structure ----
  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/CanonFlow Foundation/);
  });

  test('navbar renders with brand and navigation links', async ({ page }) => {
    await expect(page.locator('#nav-brand')).toBeVisible();
    await expect(page.locator('#nav-brand')).toContainText('CanonFlow');
    await expect(page.locator('#nav-link-projects')).toHaveAttribute('href', '#projects');
    await expect(page.locator('#nav-link-architecture')).toHaveAttribute('href', '#architecture');
    await expect(page.locator('#nav-link-rfcs')).toHaveAttribute('href', '#rfcs');
    await expect(page.locator('#nav-link-roadmap')).toHaveAttribute('href', '#roadmap');
    await expect(page.locator('#nav-link-docs')).toHaveAttribute('href', '#docs');
    await expect(page.locator('#nav-link-community')).toHaveAttribute('href', '#community');
    await expect(page.locator('#nav-link-contributing')).toHaveAttribute('href', '#contributing');
  });

  // ---- Hero Section ----
  test('hero section displays headline and tagline', async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText('CanonFlow');
    await expect(page.locator('body')).toContainText('Deterministic Semantic Infrastructure');
  });

  // ---- Projects Section ----
  test('projects section shows all three engines', async ({ page }) => {
    const projects = page.locator('#projects');
    await expect(projects).toBeVisible();
    await expect(projects).toContainText('CanonFlow');
    await expect(projects).toContainText('GSTFlow');
    await expect(projects).toContainText('EDIFlow');
  });

  // ---- Architecture Section ----
  test('architecture section shows One-Engine Law', async ({ page }) => {
    const arch = page.locator('#architecture');
    await expect(arch).toBeVisible();
    await expect(arch).toContainText('One-Engine');
  });

  // ---- Roadmap Section ----
  test('roadmap section renders with milestones', async ({ page }) => {
    const roadmap = page.locator('#roadmap');
    await expect(roadmap).toBeVisible();
    await expect(roadmap).toContainText('Core Engine');
  });

  // ---- Documentation Section ----
  test('documentation section renders', async ({ page }) => {
    const docs = page.locator('#docs');
    await expect(docs).toBeVisible();
  });

  // ---- Community Section ----
  test('community section renders', async ({ page }) => {
    const community = page.locator('#community');
    await expect(community).toBeVisible();
  });

  // ---- Contributing Section ----
  test('contributing section renders', async ({ page }) => {
    const contributing = page.locator('#contributing');
    await expect(contributing).toBeVisible();
  });

  // ---- Theme Toggle ----
  test('theme toggle switches themes', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  // ---- Responsive ----
  test('page renders at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('#nav-mobile-toggle')).toBeVisible();
  });
});
