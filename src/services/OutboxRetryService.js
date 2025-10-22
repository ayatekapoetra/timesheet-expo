import { store } from '@/src/redux/store';
import { submitTimesheet } from '@/src/redux/timesheetItemSlice';
import SQLiteService from '@/src/database/SQLiteService';

class OutboxRetryService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
    this.checkInterval = 60000; // Check every 1 minute (reduced from 10 minutes)
  }

  start() {
    if (this.isRunning) return;

    console.log('Starting OutboxRetryService...');
    this.isRunning = true;

    // Check immediately on start
    this.processDueItems();

    // Then check periodically
    this.intervalId = setInterval(() => {
      this.processDueItems();
    }, this.checkInterval);
  }

  stop() {
    if (!this.isRunning) return;

    console.log('Stopping OutboxRetryService...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async processDueItems() {
    try {
      const SQLite = SQLiteService;
      await SQLite.init();

      const dueItems = await SQLite.outboxDue();
      if (!dueItems || dueItems.length === 0) {
        return; // No items due for retry
      }

      console.log(`Processing ${dueItems.length} due outbox items...`);

      for (const item of dueItems) {
        try {
          await this.processItem(item);
        } catch (error) {
          console.error(`Failed to process outbox item ${item.id}:`, error);
          // Continue processing other items even if one fails
        }
      }
    } catch (error) {
      console.error('Error in processDueItems:', error);
    }
  }

  async processItem(item) {
    try {
      const SQLite = SQLiteService;
      const payload = JSON.parse(item.payload);

      console.log(`Retrying outbox item ${item.id} (attempt ${item.retry_count + 1})`);

      // Dispatch the submit action
      const result = await store.dispatch(submitTimesheet(payload));

      if (result.meta.requestStatus === 'fulfilled') {
        // Success - delete from outbox
        await SQLite.outboxDelete(item.id);
        console.log(`Successfully retried outbox item ${item.id}`);
      } else {
        // Failed - schedule next retry
        const now = Math.floor(Date.now() / 1000);
        const nextRetryAt = now + this.checkInterval / 1000; // Next check interval

        await SQLite.db.runAsync(
          `UPDATE outbox SET next_retry_at = ?, err_message = ?, retry_count = retry_count + 1, updated_at = strftime('%s','now') WHERE id = ?`,
          [nextRetryAt, result.payload || result.error?.message || 'Auto-retry failed', item.id]
        );

        console.log(`Failed to retry outbox item ${item.id}, scheduled for next attempt`);
      }
    } catch (error) {
      console.error(`Error processing outbox item ${item.id}:`, error);

      // On processing error, still schedule next retry
      const now = Math.floor(Date.now() / 1000);
      const nextRetryAt = now + this.checkInterval / 1000;

      try {
        const SQLite = SQLiteService;
        await SQLite.db.runAsync(
          `UPDATE outbox SET next_retry_at = ?, err_message = ?, retry_count = retry_count + 1, updated_at = strftime('%s','now') WHERE id = ?`,
          [nextRetryAt, `Processing error: ${error.message}`, item.id]
        );
      } catch (dbError) {
        console.error('Failed to update outbox item after processing error:', dbError);
      }
    }
  }

  // Method to check if service is running
  isActive() {
    return this.isRunning;
  }

  // Method to get current check interval
  getCheckInterval() {
    return this.checkInterval;
  }

  // Method to update check interval (in milliseconds)
  setCheckInterval(intervalMs) {
    this.checkInterval = intervalMs;
    if (this.isRunning) {
      // Restart with new interval
      this.stop();
      this.start();
    }
  }
}

// Create singleton instance
const outboxRetryService = new OutboxRetryService();

export default outboxRetryService;