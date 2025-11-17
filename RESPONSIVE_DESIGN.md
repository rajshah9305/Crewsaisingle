# 📱 Responsive Design Guide

The RAJAI Platform is designed to work seamlessly across all device sizes, from mobile phones to large desktop monitors.

## Breakpoints

The application uses the following breakpoints (defined in `tailwind.config.ts`):

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| `xs` | 475px | Small phones (landscape) |
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops, tablets (landscape) |
| `xl` | 1280px | Laptops, desktops |
| `2xl` | 1536px | Large desktops, monitors |

## Design Principles

### Mobile-First Approach

All components are designed mobile-first, meaning:
1. Base styles target mobile devices (< 640px)
2. Larger breakpoints progressively enhance the experience
3. Content is accessible and functional on all screen sizes

### Responsive Patterns

#### 1. **Flexible Grids**

```tsx
// Responsive grid that adapts to screen size
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Grid items */}
</div>
```

#### 2. **Adaptive Typography**

```tsx
// Text sizes that scale with screen size
<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
  Title
</h1>
```

#### 3. **Conditional Visibility**

```tsx
// Show/hide elements based on screen size
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

#### 4. **Flexible Spacing**

```tsx
// Padding that adjusts for screen size
<div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
  Content
</div>
```

## Component-Specific Guidelines

### Dashboard

**Mobile (< 640px)**
- Single column layout
- Stacked stat cards
- Simplified navigation
- Collapsible sections

**Tablet (640px - 1024px)**
- 2-column grid for stat cards
- Side-by-side agent cards
- Expanded navigation

**Desktop (> 1024px)**
- 4-column grid for stat cards
- Multi-column layouts
- Full navigation with labels
- Larger content areas

### Agent Dialog

**Mobile**
- Full-screen modal
- Scrollable content
- Larger touch targets (min 44x44px)
- Simplified form layout

**Desktop**
- Centered modal (max-width: 2xl)
- Fixed height with internal scrolling
- Compact form layout
- Hover states

### Execution Details

**Mobile**
- Single column
- Stacked information
- Simplified header
- Bottom action buttons

**Desktop**
- Multi-column layout
- Side-by-side information
- Detailed header
- Inline action buttons

## Testing Responsive Design

### Browser DevTools

1. Open Chrome/Firefox DevTools (F12)
2. Click the device toolbar icon (Ctrl+Shift+M)
3. Test these device presets:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1920px)

### Manual Testing

Test on actual devices when possible:
- [ ] iPhone (iOS Safari)
- [ ] Android phone (Chrome)
- [ ] iPad (iOS Safari)
- [ ] Android tablet (Chrome)
- [ ] Desktop (Chrome, Firefox, Safari, Edge)

### Responsive Checklist

For each new component or page:

- [ ] Works on mobile (375px width)
- [ ] Works on tablet (768px width)
- [ ] Works on desktop (1920px width)
- [ ] No horizontal scrolling
- [ ] Touch targets are at least 44x44px
- [ ] Text is readable (min 16px on mobile)
- [ ] Images scale properly
- [ ] Forms are easy to fill on mobile
- [ ] Navigation is accessible
- [ ] Modals/dialogs fit on screen
- [ ] Tables are scrollable or responsive
- [ ] No content is cut off

## Common Responsive Patterns

### 1. Responsive Container

```tsx
<div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### 2. Responsive Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
  {/* Grid items */}
</div>
```

### 3. Responsive Flex

```tsx
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
  {/* Flex items */}
</div>
```

### 4. Responsive Text

```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Heading
</h1>
<p className="text-sm sm:text-base lg:text-lg">
  Body text
</p>
```

### 5. Responsive Spacing

```tsx
<div className="space-y-4 sm:space-y-6 lg:space-y-8">
  {/* Vertically spaced items */}
</div>
```

### 6. Responsive Images

```tsx
<img 
  src="/image.png" 
  alt="Description"
  className="w-full h-auto max-w-md mx-auto"
/>
```

## Accessibility Considerations

### Touch Targets

- Minimum size: 44x44px (iOS) or 48x48px (Android)
- Add padding to increase touch area
- Ensure adequate spacing between interactive elements

```tsx
<Button className="min-h-[44px] min-w-[44px] p-3">
  Click me
</Button>
```

### Font Sizes

- Body text: minimum 16px on mobile (prevents zoom on iOS)
- Headings: scale proportionally
- Use relative units (rem) for better accessibility

### Viewport Meta Tag

Already configured in `client/index.html`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## Performance Optimization

### Image Optimization

- Use appropriate image sizes for each breakpoint
- Implement lazy loading for images
- Use modern formats (WebP, AVIF) with fallbacks

### Code Splitting

- Components are automatically code-split by Vite
- Lazy load heavy components when possible

### CSS Optimization

- Tailwind CSS purges unused styles in production
- Critical CSS is inlined automatically

## Common Issues and Solutions

### Issue: Horizontal Scrolling

**Solution:**
```tsx
// Add overflow-x-hidden to container
<div className="overflow-x-hidden">
  {/* Content */}
</div>
```

### Issue: Text Overflow

**Solution:**
```tsx
// Use truncate or line-clamp
<p className="truncate">Long text...</p>
<p className="line-clamp-2">Multi-line text...</p>
```

### Issue: Fixed Width Elements

**Solution:**
```tsx
// Use max-width instead of width
<div className="w-full max-w-md">
  {/* Content */}
</div>
```

### Issue: Small Touch Targets

**Solution:**
```tsx
// Increase padding and minimum size
<button className="p-3 min-h-[44px] min-w-[44px]">
  Icon
</button>
```

## Testing Tools

### Browser Extensions

- **Responsive Viewer** (Chrome) - Test multiple devices simultaneously
- **Window Resizer** (Chrome/Firefox) - Quick device size presets
- **Lighthouse** (Chrome DevTools) - Performance and accessibility audit

### Online Tools

- [Responsive Design Checker](https://responsivedesignchecker.com/)
- [BrowserStack](https://www.browserstack.com/) - Real device testing
- [LambdaTest](https://www.lambdatest.com/) - Cross-browser testing

## Best Practices

1. **Test Early and Often** - Check responsive design as you build
2. **Use Real Devices** - Emulators don't catch everything
3. **Consider Touch** - Design for touch-first on mobile
4. **Optimize Performance** - Mobile users often have slower connections
5. **Test Landscape** - Don't forget landscape orientation
6. **Check Forms** - Forms are especially important on mobile
7. **Test Navigation** - Ensure navigation works on all sizes
8. **Verify Readability** - Text should be readable without zooming

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Web.dev Responsive Design](https://web.dev/responsive-web-design-basics/)

## Maintenance

When adding new features:

1. Design mobile layout first
2. Add tablet breakpoints
3. Enhance for desktop
4. Test on all breakpoints
5. Verify touch interactions
6. Check accessibility
7. Optimize performance

Remember: A responsive design is never "done" - continuously test and improve based on user feedback and analytics.
