export const emailTemplates = {
    orderCreated: (order: any) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Order Confirmation</h1>
      <p>Thank you for your order, ${order.buyer.name}!</p>
      <p>Order #${order.orderNumber} has been placed successfully.</p>
      
      <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Order Details</h3>
        <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)} Birr</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>

      <p>Please log in to your dashboard to view full details and track your order.</p>
    </div>
  `,

    paymentReceived: (order: any) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Payment Received</h1>
      <p>Hello ${order.seller.name},</p>
      <p>You have received a new payment for Order #${order.orderNumber}.</p>
      
      <div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #38b2ac;">
        <h3>Payment Details</h3>
        <p><strong>Amount:</strong> ${order.totalAmount.toFixed(2)} Birr</p>
        <p><strong>Status:</strong> Funds held in Escrow</p>
      </div>

      <p>Please ship the items as soon as possible to release the funds.</p>
    </div>
  `,

    orderShipped: (order: any) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Order Shipped!</h1>
      <p>Good news, ${order.buyer.name}!</p>
      <p>Your order #${order.orderNumber} has been shipped.</p>
      
      <div style="background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #4299e1;">
        <h3>Shipping Update</h3>
        <p>The seller has marked your order as shipped.</p>
      </div>

      <p>Please confirm delivery once you receive the items to release the payment to the seller.</p>
    </div>
  `,

    orderDelivered: (order: any) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Order Completed</h1>
      <p>Hello ${order.seller.name},</p>
      <p>The buyer has confirmed delivery for Order #${order.orderNumber}.</p>
      
      <div style="background: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #48bb78;">
        <h3>Funds Released</h3>
        <p><strong>Amount:</strong> ${order.totalAmount.toFixed(2)} Birr</p>
        <p><strong>Status:</strong> Added to your Wallet</p>
      </div>

      <p>Thank you for using Azmera!</p>
    </div>
  `
};
