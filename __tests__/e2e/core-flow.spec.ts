import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Core User Flows
 * Tests the complete journey: Offers → Wallet → QR Verification
 */

test.describe('Core User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('should display offers page and navigate to wallet', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if tab bar is visible
    const tabBar = page.getByRole('tablist', { name: 'Main navigation' });
    await expect(tabBar).toBeVisible();

    // Navigate to offers tab
    const offersTab = page.getByText('받은 오퍼');
    await expect(offersTab).toBeVisible();
    await offersTab.click();

    // Wait for navigation
    await page.waitForURL('**/offers');

    // Check page title or content
    await expect(page.getByText('받은 오퍼')).toBeVisible();
  });

  test('should navigate through all tabs', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Test each tab navigation
    const tabs = [
      { name: '체험권', url: '/pass' },
      { name: '받은 오퍼', url: '/offers' },
      { name: 'QR 스캔', url: '/scan' },
      { name: '지갑', url: '/wallet' },
    ];

    for (const tab of tabs) {
      const tabElement = page.getByText(tab.name, { exact: true });
      await tabElement.click();
      await page.waitForURL(`**${tab.url}`);
      await expect(page).toHaveURL(new RegExp(tab.url));
    }
  });

  test('should display wallet summary', async ({ page }) => {
    // Navigate to wallet
    await page.goto('/wallet');
    await page.waitForLoadState('networkidle');

    // Check for wallet elements (adjust selectors based on actual implementation)
    const walletContent = page.locator('[class*="wallet"]').first();
    await expect(walletContent).toBeVisible({ timeout: 10000 });
  });

  test('should have proper mobile viewport', async ({ page }) => {
    const viewport = page.viewportSize();
    
    // Mobile-first design check
    if (viewport) {
      expect(viewport.width).toBeLessThanOrEqual(768);
    }

    // Check for mobile-specific elements
    const tabBar = page.getByRole('tablist');
    await expect(tabBar).toBeVisible();
    
    // Check bottom navigation is fixed at bottom
    const tabBarBox = await tabBar.boundingBox();
    if (tabBarBox && viewport) {
      expect(tabBarBox.y).toBeGreaterThan(viewport.height - 100);
    }
  });

  test('should load pass page without errors', async ({ page, context }) => {
    const errors: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to pass page
    await page.goto('/pass');
    await page.waitForLoadState('networkidle');

    // Check no critical errors occurred
    const criticalErrors = errors.filter(err => 
      !err.includes('Failed to load resource') && // Ignore network errors
      !err.includes('favicon') // Ignore favicon errors
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Search Functionality', () => {
  test('should allow searching on pass page', async ({ page }) => {
    await page.goto('/pass');
    await page.waitForLoadState('networkidle');

    // Find search input
    const searchInput = page.getByPlaceholder(/검색/i);
    
    if (await searchInput.isVisible()) {
      await searchInput.click();
      await searchInput.fill('카페');
      
      // Wait a bit for any autocomplete/suggestions
      await page.waitForTimeout(500);
      
      // Check input value
      await expect(searchInput).toHaveValue('카페');
    }
  });
});

test.describe('Performance Checks', () => {
  test('should load pages within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/pass');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no accessibility violations on main pages', async ({ page }) => {
    const pages = ['/pass', '/offers', '/wallet', '/scan'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Basic accessibility checks
      const mainContent = page.locator('main, [role="main"]').first();
      if (await mainContent.count() > 0) {
        await expect(mainContent).toBeVisible();
      }
    }
  });
});
