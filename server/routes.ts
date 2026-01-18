import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import type { Order } from "@shared/schema";

async function sendOrderNotification(order: Order) {
  try {
    const topic = process.env.NTFY_TOPIC || "food-prep-orders";
    
    let message = `New Order #${order.id}\n`;
    message += `Pickup: ${order.pickupDate}\n`;
    
    if (order.mainItemId) {
      const main = await storage.getMenuItem(order.mainItemId);
      if (main) {
        message += `Main: ${order.mainQuantity}x ${main.name}\n`;
      }
    }
    
    if (order.dessertItemId) {
      const dessert = await storage.getMenuItem(order.dessertItemId);
      if (dessert) {
        message += `Dessert: ${order.dessertQuantity}x ${dessert.name}\n`;
      }
    }
    
    message += `Total: $${(order.totalPrice / 100).toFixed(2)}`;

    await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      body: message,
      headers: {
        'Title': 'New Food Order Received',
        'Priority': 'high',
        'Tags': 'shallow_pan_of_food'
      }
    });
    console.log('Notification sent to ntfy.sh/' + topic);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed data on startup
  await storage.seedMenuItems();

  app.get(api.menu.list.path, async (req, res) => {
    const items = await storage.getMenuItems();
    res.json(items);
  });

  app.get(api.menu.get.path, async (req, res) => {
    const item = await storage.getMenuItem(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      
      // Send notification asynchronously
      sendOrderNotification(order).catch(err => {
        console.error("Background notification failed:", err);
      });

      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
