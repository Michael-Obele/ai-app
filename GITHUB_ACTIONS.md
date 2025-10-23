# GitHub Actions Workflows

This project includes automated workflows for version management and releases.

## Workflows

### 1. Version and Release (`version-and-release.yml`)

**Trigger**: Manual workflow dispatch via GitHub Actions UI

**Purpose**: Bump the project version and create a release PR

**How to use**:

1. Go to Actions tab in GitHub
2. Select "Version and Release" workflow
3. Click "Run workflow"
4. Choose version bump type:
   - `patch` - Bug fixes (1.0.0 → 1.0.1)
   - `minor` - New features (1.0.0 → 1.1.0)
   - `major` - Breaking changes (1.0.0 → 2.0.0)

**What it does**:

1. Bumps version in `package.json`
2. Updates `CHANGELOG.md` with new version entry
3. Commits changes
4. Creates a Pull Request with the version bump

**Next steps**: Review and merge the PR to trigger the release creation.

### 2. Create GitHub Release (`create-release.yml`)

**Trigger**: Automatic when `package.json` changes on `main` branch

**Purpose**: Automatically create a GitHub release when version is bumped

**What it does**:

1. Detects version changes in `package.json`
2. Extracts changelog section for the new version
3. Creates a GitHub Release with:
   - Tag: `v{version}` (e.g., v1.0.1)
   - Title: "Release v{version}"
   - Body: Changelog content for that version

**Notes**:

- Only runs if version actually changed
- Uses changelog from `CHANGELOG.md` for release notes
- Automatically creates Git tag

## Workflow Integration

The two workflows work together:

```
1. Developer runs "Version and Release" workflow
   └─> Creates PR with version bump + changelog

2. PR is reviewed and merged to main
   └─> Triggers "Create GitHub Release" workflow
       └─> Automatically creates GitHub release with tag
```

## Manual Version Bumping

If you prefer to bump versions manually:

```bash
# Bump version
npm version patch  # or minor, or major

# Update CHANGELOG.md manually

# Commit and push
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: bump version to 1.0.1"
git push origin main
```

The "Create GitHub Release" workflow will still run automatically when the version change is pushed to main.

## Changelog Format

The workflows expect `CHANGELOG.md` to follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [1.0.1] - 2025-01-15

### Fixed

- Bug fix description

### Added

- New feature description

## [1.0.0] - 2025-01-14

### Added

- Initial release
```

## Customization

### Change Version Bump Behavior

Edit `.github/workflows/version-and-release.yml`:

```yaml
# Change default version type
default: "minor" # instead of 'patch'
```

### Customize Release Notes

Edit `.github/workflows/create-release.yml` to change how release notes are generated from the changelog.

### Add Pre-release Support

Modify the workflows to support pre-release versions:

```bash
npm version prerelease --preid=beta
# Creates: 1.0.0-beta.1
```

## Security Notes

- Workflows use `GITHUB_TOKEN` for authentication (automatically provided)
- No manual token configuration needed
- Workflows have minimal permissions (contents: write, pull-requests: write)

## Troubleshooting

### Workflow not running

**Check**:

1. Workflows are in `.github/workflows/` directory
2. Workflows are valid YAML
3. Repository has Actions enabled (Settings → Actions)

### PR not created

**Check**:

1. GitHub token has correct permissions
2. No conflicting branch already exists
3. Check workflow run logs for errors

### Release not created

**Check**:

1. Version actually changed in `package.json`
2. `CHANGELOG.md` exists and has entry for new version
3. Check workflow run logs for errors

## Future Enhancements

Possible improvements:

- [ ] Add automated testing before version bump
- [ ] Integrate with npm publishing
- [ ] Add Slack/Discord notifications for releases
- [ ] Generate changelogs from commit messages (Conventional Commits)
- [ ] Add release asset uploads (build artifacts, etc.)
