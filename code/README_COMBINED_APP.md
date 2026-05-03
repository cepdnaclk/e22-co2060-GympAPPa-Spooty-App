# GymPAPPa Combined App

This workspace has been reorganized so that the main unified application is now:

- `gympappa-app/`

The separate prototype apps have been archived under:

- `archive-old-apps/availability-dashboard/`
- `archive-old-apps/equipment-handling/`
- `archive-old-apps/equipment-module/`
- `archive-old-apps/login-profile-pages/`

## Usage

To run the combined app:

1. Open `gympappa-app/`
2. Install dependencies in both `gympappa-app/backend/` and `gympappa-app/frontend/`
3. Start the backend and frontend with `npm run dev` or `npm start` as configured

## Notes

The `gympappa-app` project already includes:

- Login/register/profile flows
- Equipment availability dashboard
- Equipment request/return pages
- Staff request approvals and stock management

If you want, I can also merge the archive contents into the `gympappa-app` codebase more explicitly by copying any missing components or routes from the archived prototypes.