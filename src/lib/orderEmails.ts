import { sendEmail } from './sendEmail';
import type { OrderStatus } from './database.types';

// =============================================================
// Order-event email notifications.
//
// Fires fire-and-forget emails to the placing school and fulfilling
// maker space whenever an order moves through the pipeline:
//
//   placed         → both parties
//   accepted       → placer
//   in_production  → placer
//   shipped        → placer
//
// We stop at shipped because the placer takes the next action
// (marking delivered) so they're already in the loop.
//
// The recipients are the schools.contact_email of each party. If the
// school doesn't have one on file the email for that side is silently
// skipped — the toast notification in the dashboard still fires.
// =============================================================

export interface OrderEmailContext {
  productName:    string;
  productSku?:    string | null;
  quantity:       number;
  placerName:     string;
  fulfillerName?: string | null;
  placerEmail?:   string | null;
  fulfillerEmail?: string | null;
  dashboardUrl?:  string;       // optional override; defaults to current origin
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const HUMAN_STATUS: Record<OrderStatus, string> = {
  placed:        'placed',
  accepted:      'accepted',
  in_production: 'in production',
  shipped:       'shipped',
  delivered:     'delivered',
  cancelled:     'cancelled',
};

function wrap(title: string, bodyHtml: string, ctaUrl?: string): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#1f2937;max-width:560px;line-height:1.5;">
      <h2 style="margin:0 0 8px;">${escape(title)}</h2>
      ${bodyHtml}
      ${ctaUrl ? `
        <p style="margin-top:24px;">
          <a href="${escape(ctaUrl)}" style="display:inline-block;padding:8px 14px;background:#0f766e;color:#fff;text-decoration:none;border-radius:6px;">
            Open dashboard
          </a>
        </p>` : ''}
      <p style="margin-top:24px;color:#6b7280;font-size:13px;">— ChipuRobo</p>
    </div>`;
}

function lineItem(c: OrderEmailContext): string {
  const sku = c.productSku ? ` <span style="color:#6b7280;">(${escape(c.productSku)})</span>` : '';
  return `<p><strong>${escape(c.productName)}</strong>${sku} &times; ${c.quantity}</p>`;
}

function dashboardUrl(c: OrderEmailContext, path: string): string {
  const base = c.dashboardUrl ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}${path}`;
}

// -------------------------------------------------------------
// One entry point — fires every email for a given (event, order).
// -------------------------------------------------------------
export async function notifyOrderEvent(
  event:    OrderStatus,
  context:  OrderEmailContext,
): Promise<void> {
  const friendly = HUMAN_STATUS[event];
  const ordersUrl   = dashboardUrl(context, '/dashboard/school/orders');
  const productionUrl = dashboardUrl(context, '/dashboard/school/production');

  // Build messages per recipient role.
  const placerHtml = wrap(
    eventTitleForPlacer(event, context),
    `${lineItem(context)}
     <p>Status: <strong>${friendly}</strong>.</p>
     <p>You ordered this from <strong>${escape(context.fulfillerName ?? 'a maker space')}</strong>.</p>`,
    ordersUrl,
  );

  const fulfillerHtml = wrap(
    eventTitleForFulfiller(event, context),
    `${lineItem(context)}
     <p>Status: <strong>${friendly}</strong>.</p>
     <p>Placed by <strong>${escape(context.placerName)}</strong>.</p>`,
    productionUrl,
  );

  const tasks: Promise<unknown>[] = [];

  // Placer gets notified on every relevant transition.
  if (context.placerEmail) {
    tasks.push(
      sendEmail({
        to:      context.placerEmail,
        subject: eventTitleForPlacer(event, context),
        html:    placerHtml,
      }).catch((e) => console.error('[orderEmails] placer send failed', e)),
    );
  }

  // Fulfiller only needs to know on initial 'placed' — beyond that it's
  // them performing the action, so emailing themselves is noise.
  if (event === 'placed' && context.fulfillerEmail) {
    tasks.push(
      sendEmail({
        to:      context.fulfillerEmail,
        subject: eventTitleForFulfiller(event, context),
        html:    fulfillerHtml,
      }).catch((e) => console.error('[orderEmails] fulfiller send failed', e)),
    );
  }

  // Fire-and-forget — don't block the UI.
  void Promise.all(tasks);
}

function eventTitleForPlacer(event: OrderStatus, c: OrderEmailContext): string {
  switch (event) {
    case 'placed':        return `Your order has been placed — ${c.productName}`;
    case 'accepted':      return `Order accepted by ${c.fulfillerName ?? 'maker space'}`;
    case 'in_production': return `Order in production at ${c.fulfillerName ?? 'maker space'}`;
    case 'shipped':       return `Order shipped from ${c.fulfillerName ?? 'maker space'}`;
    case 'delivered':     return `Order delivered`;
    case 'cancelled':     return `Order cancelled`;
  }
}

function eventTitleForFulfiller(event: OrderStatus, c: OrderEmailContext): string {
  switch (event) {
    case 'placed':        return `New order from ${c.placerName} — ${c.productName}`;
    case 'accepted':      return `You accepted ${c.placerName}'s order`;
    case 'in_production': return `Production started for ${c.placerName}`;
    case 'shipped':       return `Order shipped to ${c.placerName}`;
    case 'delivered':     return `Order delivered to ${c.placerName}`;
    case 'cancelled':     return `Order cancelled`;
  }
}
