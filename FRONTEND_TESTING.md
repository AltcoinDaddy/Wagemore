# Frontend Testing Guide

## Quick Test (2 minutes)

### 1. Install Dependencies
```bash
cd flowwager_v2
pnpm install
```

Expected output:
- No errors
- Dependencies installed in `node_modules/`
- `pnpm-lock.yaml` generated

### 2. Start Frontend Only
```bash
pnpm dev:frontend
```

Expected output:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

### 3. Open Browser
Navigate to: `http://localhost:3000`

Expected to see:
- ✅ Wagermore title in large text
- ✅ "A modern monorepo with React frontend and Hono backend"
- ✅ 6 feature cards (Type-Safe, Lightning Fast, Production Ready, etc.)
- ✅ Quick start section with commands
- ✅ Dark theme with cyan accents
- ✅ Responsive layout (works on mobile too)

### 4. Test Navigation
Click the hamburger menu (☰) icon in top-left:
- ✅ Menu should slide in from left
- ✅ "Navigation" title appears
- ✅ Close button (X) appears
- ✅ "Home" link is visible
- ✅ Click "Home" - page navigates (still on home)
- ✅ Click "Home" again - stays on page
- ✅ Click X to close menu - menu slides out

### 5. Test Responsiveness
Resize browser window:
- ✅ Layout adapts to different screen sizes
- ✅ No horizontal scrolling
- ✅ Text remains readable
- ✅ Menu still works on mobile view

### 6. Check Browser Console
Press `F12` to open DevTools, check Console tab:
- ✅ No red errors
- ✅ No warnings about missing routes
- ✅ No TypeScript errors
- ✅ Clean output

### 7. Test DevTools
In DevTools tabs, you should see:
- ✅ React tab - can inspect components
- ✅ No "devtools not found" errors

## Full Test (5 minutes)

### Build Test
```bash
pnpm build:frontend
```

Expected:
- ✅ Build completes without errors
- ✅ Output folder created: `packages/frontend/dist/`
- ✅ HTML, CSS, JS files generated
- ✅ No TypeScript errors

### TypeScript Check
```bash
cd packages/frontend
pnpm tsc --noEmit
```

Expected:
- ✅ No TypeScript errors
- ✅ Command completes successfully

### Linting
```bash
pnpm lint
```

Expected:
- ✅ No linting errors
- ✅ All files pass ESLint checks

## Detailed Component Tests

### Header Component Test

1. **Rendering**
   - ✅ Menu icon visible in header
   - ✅ "Wagermore" text visible
   - ✅ Header has dark background

2. **Menu Functionality**
   - ✅ Clicking menu icon opens sidebar
   - ✅ Sidebar has smooth animation
   - ✅ X button closes sidebar
   - ✅ Clicking outside closes sidebar
   - ✅ Home link navigates correctly

3. **Mobile View**
   - ✅ Menu icon always visible
   - ✅ Sidebar works on mobile
   - ✅ Hamburger icon size appropriate

### Index Page Test

1. **Content**
   - ✅ Wagermore title displays
   - ✅ Subtitle shows correct text
   - ✅ Description text visible
   - ✅ All 6 feature cards present
   - ✅ Quick start section visible

2. **Styling**
   - ✅ Dark theme applied
   - ✅ Cyan/blue accent colors visible
   - ✅ Gradient background renders
   - ✅ Cards have proper spacing
   - ✅ Text is readable

3. **Interactivity**
   - ✅ Hover on cards shows border highlight
   - ✅ No console errors on interaction
   - ✅ Page is responsive

### Root Route Test

1. **Layout**
   - ✅ Header renders at top
   - ✅ Content centered properly
   - ✅ Footer content visible (if applicable)

2. **DevTools**
   - ✅ React DevTools icon visible
   - ✅ Router DevTools accessible
   - ✅ Can interact with devtools

## Error Scenarios (Should NOT see these)

### ❌ Route Errors
- Should NOT see: "Cannot find module '/demo/drizzle'"
- Should NOT see: "Route not found"
- Should NOT see: "Failed to import route"

### ❌ Component Errors
- Should NOT see: "Cannot find 'Header' component"
- Should NOT see: "Missing import"
- Should NOT see: React component errors

### ❌ Styling Errors
- Should NOT see: Unstyled page (pure white)
- Should NOT see: TailwindCSS not loading
- Should NOT see: Icons not displaying

### ❌ DevTools Errors
- Should NOT see: "Cannot find devtools"
- Should NOT see: "Module not found: ../lib/demo-store-devtools"
- Should NOT see: "Module not found: ../integrations/tanstack-query/devtools"

## Performance Test

### Load Time
```bash
# Open DevTools Network tab and reload
# Check:
```
- ✅ Page loads in < 2 seconds
- ✅ No failed requests (404 errors)
- ✅ CSS and JS files load successfully

### Bundle Size
```bash
pnpm build:frontend
# Check dist/ folder size
```
- ✅ Total bundle < 500KB (gzipped)
- ✅ Main JS file reasonable size
- ✅ CSS file loads quickly

## Integration Test

### Frontend + Backend
```bash
# Terminal 1
pnpm dev:frontend

# Terminal 2
pnpm dev:backend
```

Expected:
- ✅ Frontend runs on port 3000
- ✅ Backend runs (check its port)
- ✅ Both run without interfering
- ✅ Can navigate frontend while backend runs

## Final Checklist

| Item | Status |
|------|--------|
| Dependencies install | ✅ |
| Dev server starts | ✅ |
| Homepage loads | ✅ |
| Navigation works | ✅ |
| No console errors | ✅ |
| Responsive design | ✅ |
| Build succeeds | ✅ |
| TypeScript passes | ✅ |
| No missing imports | ✅ |
| Styling applies | ✅ |
| Icons render | ✅ |
| DevTools available | ✅ |

## Troubleshooting

### Issue: Port 3000 already in use
**Solution**: 
```bash
# Find and kill process on port 3000
# Or change port in packages/frontend/vite.config.ts
```

### Issue: Module not found errors
**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules packages/*/node_modules pnpm-lock.yaml
pnpm install
```

### Issue: Styling not loading
**Solution**:
```bash
# Restart dev server
# Check TailwindCSS is installed
pnpm --filter @wagermore/frontend list tailwindcss
```

### Issue: TypeScript errors
**Solution**:
```bash
# Restart TypeScript server in IDE
# Command: Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

## Success Criteria

Your frontend is working correctly when:

✅ `pnpm dev:frontend` starts without errors
✅ Browser loads http://localhost:3000
✅ Wagermore homepage displays
✅ All styling and layout correct
✅ Navigation menu works
✅ No console errors
✅ Build completes successfully
✅ TypeScript shows no errors
✅ ESLint passes
✅ Responsive design works

## Next Steps After Testing

Once all tests pass:

1. **Add new routes** as needed
2. **Connect to backend** when ready
3. **Add components** for features
4. **Test with backend** running together
5. **Deploy** to production

---

**All Frontend Tests Passed! 🎉**

Your Wagermore frontend is working correctly and ready for development!