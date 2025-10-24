# Contributing to DSMS

Thank you for your interest in contributing to the Disease Surveillance Management System! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)

## 📜 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Prioritize public health and data privacy
- Follow security best practices

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/your-username/dsms.git
cd dsms/dengue
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Set up database
npm run prisma:migrate
npm run db:seed
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 🔄 Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `style/description` - UI/UX improvements

### Commit Message Format

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```bash
git commit -m "feat(reporting): add multi-disease reporting support"
git commit -m "fix(auth): resolve JWT expiration issue"
git commit -m "docs(setup): update installation instructions"
```

## 📐 Coding Standards

### TypeScript Guidelines

1. **Type Everything**
   ```typescript
   // ✅ Good
   interface DiseaseReport {
     id: string;
     diseaseId: string;
     symptoms: string[];
   }
   
   // ❌ Avoid
   const report: any = {...}
   ```

2. **Use Interfaces Over Types**
   ```typescript
   // ✅ Preferred
   interface User {
     id: string;
     name: string;
   }
   
   // ⚠️ Use types for unions/intersections only
   type UserRole = 'admin' | 'health_worker';
   ```

3. **Follow Component Structure**
   ```typescript
   // File: src/components/example-component.tsx
   export default function ExampleComponent() {
     // 1. Hooks (state, context, custom hooks)
     // 2. Event handlers
     // 3. Render logic
     // 4. Subcomponents (at bottom)
   }
   ```

### Responsive Design Principles

Follow the box-based layout system from `uienhancement.md`:

1. **Mobile-First Approach**
   ```tsx
   // ✅ Good - Mobile first
   <div className="w-full sm:w-1/2 lg:w-1/4">
   
   // ❌ Bad - Desktop first
   <div className="w-1/4 lg:w-full">
   ```

2. **Touch Targets**
   ```tsx
   // ✅ Minimum 44px on mobile
   <button className="h-11 sm:h-10">
   
   // ❌ Too small for touch
   <button className="h-6">
   ```

3. **Responsive Typography**
   ```tsx
   // ✅ Scales with screen size
   <h1 className="text-2xl sm:text-3xl lg:text-4xl">
   
   // ❌ Fixed size
   <h1 className="text-4xl">
   ```

### Accessibility Requirements

- ARIA labels for all interactive elements
- Keyboard navigation support
- Color contrast ≥ 4.5:1
- Screen reader compatibility

### Security Guidelines

1. **Never hardcode secrets**
   ```typescript
   // ✅ Good
   const secret = process.env.JWT_SECRET;
   
   // ❌ Bad
   const secret = "hardcoded-secret";
   ```

2. **Sanitize user input**
   ```typescript
   // ✅ Use Zod for validation
   const schema = z.object({
     email: z.string().email(),
     name: z.string().min(1).max(100)
   });
   ```

3. **Protect sensitive routes**
   ```typescript
   // ✅ Use authentication wrapper
   <DashboardWrapper allowedRoles={[UserRole.Admin]}>
   ```

## 🧪 Testing Guidelines

### Before Submitting

1. **Lint your code**
   ```bash
   npm run lint
   ```

2. **Test responsive design**
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1024px+)

3. **Verify database changes**
   ```bash
   npm run prisma:studio
   ```

4. **Check for TypeScript errors**
   ```bash
   npx tsc --noEmit
   ```

## 📝 Pull Request Process

### 1. Update Your Branch

```bash
git fetch origin
git rebase origin/main
```

### 2. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

On GitHub:
1. Click "New Pull Request"
2. Select your branch
3. Fill in the PR template:

```markdown
## Description
[Describe what this PR does]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on mobile (375px)
- [ ] Tested on tablet (768px)
- [ ] Tested on desktop (1024px+)
- [ ] No console errors
- [ ] Linting passes

## Screenshots (if applicable)
[Add before/after screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] No new warnings
```

### 4. Code Review

- Address review comments promptly
- Update your branch with requested changes
- Respond to all feedback

### 5. Merge

Once approved:
- Squash commits if needed
- Ensure tests pass
- PR will be merged by maintainers

## 🎯 Priority Areas for Contribution

### High Priority

- 📱 Mobile responsiveness improvements
- 🔒 Security enhancements
- ♿ Accessibility features
- 📊 Data visualization components
- 🗺️ Mapping functionality

### Medium Priority

- 📝 Documentation improvements
- 🧪 Test coverage
- 🎨 UI/UX enhancements
- 🌐 Internationalization

### Low Priority

- 🔧 Code refactoring
- ⚡ Performance optimizations
- 📦 Dependency updates

## 💡 Tips for Contributors

1. **Start Small**: Begin with documentation or minor bug fixes
2. **Ask Questions**: Use GitHub Discussions or Issues
3. **Follow Patterns**: Look at existing code for examples
4. **Test Thoroughly**: Check all breakpoints and user roles
5. **Document Changes**: Update relevant docs with your changes

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Guides](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🆘 Getting Help

- 💬 [GitHub Discussions](../../discussions)
- 🐛 [Report Issues](../../issues)
- 📧 Email: dev@dsms.gov

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to public health! 🏥💚**

