# ChapChap - Get Paid Faster

Automated payment reminders for East African businesses. Send invoices, get paid via M-Pesa & cards, and never chase a payment again.

![ChapChap Dashboard](https://via.placeholder.com/800x400?text=ChapChap+Dashboard)

## Features

- 📧 **Automated Reminders** - SMS, Email & WhatsApp reminders sent automatically
- 💳 **Paystack Integration** - Accept M-Pesa, cards, and bank transfers
- 📊 **Dashboard Analytics** - Track outstanding, overdue, and paid invoices
- 👥 **Client Management** - Store and manage client information
- 📱 **Mobile Responsive** - Works on all devices
- 🔒 **Secure** - Row Level Security with Supabase

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Paystack
- **Email**: Resend
- **SMS**: Africa's Talking
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Paystack account
- Resend account (for emails)
- Africa's Talking account (for SMS)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/chapchap.git
cd chapchap
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxx

# Resend (Email)
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=invoices@yourdomain.com

# Africa's Talking (SMS)
AT_USERNAME=sandbox
AT_API_KEY=xxxxx
```

### 4. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration to create tables:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL in supabase/migrations/001_initial_schema.sql
```

### 5. Deploy Edge Functions (optional)

```bash
supabase functions deploy paystack-webhook
supabase functions deploy check-reminders
supabase functions deploy send-invoice
```

Set secrets for Edge Functions:

```bash
supabase secrets set PAYSTACK_SECRET_KEY=sk_xxx
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set EMAIL_FROM=invoices@yourdomain.com
supabase secrets set AT_USERNAME=sandbox
supabase secrets set AT_API_KEY=xxx
supabase secrets set APP_URL=https://yourdomain.com
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
chapchap/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   ├── api/               # API routes
│   │   └── payment/           # Payment callback
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── clients/           # Client management
│   │   ├── invoices/          # Invoice components
│   │   ├── settings/          # Settings components
│   │   └── landing/           # Landing page sections
│   ├── lib/
│   │   ├── supabase/          # Supabase clients & types
│   │   ├── utils/             # Utility functions
│   │   ├── paystack.ts        # Paystack integration
│   │   ├── notifications.ts   # Email/SMS functions
│   │   └── reminder-templates.ts
│   └── hooks/                 # Custom React hooks
├── supabase/
│   ├── migrations/            # Database migrations
│   └── functions/             # Edge Functions
└── public/                    # Static assets
```

## Database Schema

### Tables

- **users** - User profiles (synced with Supabase Auth)
- **clients** - Client information
- **invoices** - Invoice records
- **payments** - Payment records
- **reminders** - Scheduled reminders
- **user_settings** - User preferences

### Row Level Security

All tables have RLS enabled. Users can only access their own data.

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/paystack/initialize` | POST | Create payment link |
| `/api/paystack/verify` | GET | Verify payment |
| `/api/paystack/webhook` | POST | Handle Paystack webhooks |
| `/api/reminders/send` | POST | Send reminder manually |

## Paystack Webhook Setup

1. Go to Paystack Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/paystack-webhook`
3. Select events: `charge.success`, `charge.failed`

## Scheduled Reminders

Set up a cron job in Supabase to check reminders daily:

```sql
SELECT cron.schedule(
  'check-reminders-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/check-reminders',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📧 Email: support@chapchap.co.ke
- 📖 Documentation: [docs.chapchap.co.ke](https://docs.chapchap.co.ke)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/chapchap/issues)

---

Made with ❤️ in East Africa
