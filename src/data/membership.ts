// ─── The only file to edit when membership pricing changes ───────────────────
//
// Stripe issues a new payment link for every price, so changing what membership
// costs means replacing a URL here rather than editing one in place. Both
// button rows on /join read these, which is the point: they used to be written
// out twice, and the second one was the easy one to miss.

export const MONTHLY_CHECKOUT_URL = 'https://buy.stripe.com/9B600kaVm1Wk0sg35X3VC0c';
export const YEARLY_CHECKOUT_URL = 'https://buy.stripe.com/4gM7sMd3ubwU2AocGx3VC0d';
export const MONTHLY_PRICE = '$50';
export const YEARLY_PRICE = '$500';
