import { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => (
  <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(var(--color-primary),0.2),_rgb(var(--color-background)))] px-4 py-10 text-foreground">
    <div className="mx-auto w-full max-w-4xl rounded-[2.5rem] border border-border/50 bg-background/70 p-8 shadow-soft backdrop-blur">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col justify-center rounded-[2rem] border border-border/40 bg-card/70 p-8 shadow-soft">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">IoT Portal</p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8 space-y-6 text-sm text-muted-foreground">
            <div>
              <p className="text-foreground">Zero-trust perimeter</p>
              <p>SSO ready – SCIM provisioning, SAML2, and audit logging baked in.</p>
            </div>
            <div>
              <p className="text-foreground">99.99% uptime SLA</p>
              <p>Edge gateways monitored around the clock with predictive remediation.</p>
            </div>
          </div>
        </div>
        <section className="rounded-[2rem] border border-border/60 bg-card/80 p-8 shadow-soft backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Access</p>
            <h2 className="mt-2 text-2xl font-semibold text-card-foreground">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="mt-6 space-y-6">{children}</div>
          {footer && <div className="mt-8 text-sm text-muted-foreground">{footer}</div>}
        </section>
      </div>
    </div>
  </main>
);

export default AuthLayout;
