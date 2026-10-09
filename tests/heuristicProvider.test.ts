import { describe, it, expect } from 'vitest';
import { HeuristicProvider } from '../src/ai/heuristicProvider';

describe('HeuristicProvider', () => {
  const provider = new HeuristicProvider();

  describe('Duration parsing', () => {
    it('parses numeric minutes correctly', async () => {
      const res = await provider.extractIntent('I have 45 minutes to go outside');
      expect(res.durationMinutes).toBe(45);
    });

    it('parses 90 minutes correctly', async () => {
      const res = await provider.extractIntent('I have 90 mins free this evening');
      expect(res.durationMinutes).toBe(90);
    });

    it('parses "half an hour" as 30 minutes', async () => {
      const res = await provider.extractIntent('I have half an hour for a quick walk');
      expect(res.durationMinutes).toBe(30);
    });

    it('parses "1 hour" or "one hour" as 60 minutes', async () => {
      const res1 = await provider.extractIntent('I have 1 hour free');
      expect(res1.durationMinutes).toBe(60);

      const res2 = await provider.extractIntent('I have one hour to clear my head');
      expect(res2.durationMinutes).toBe(60);
    });

    it('parses "2 hours" as 120 minutes', async () => {
      const res = await provider.extractIntent('I have 2 hours, I am tired');
      expect(res.durationMinutes).toBe(120);
    });

    it('parses "1.5 hours" as 90 minutes', async () => {
      const res = await provider.extractIntent('I have 1.5 hours this afternoon');
      expect(res.durationMinutes).toBe(90);
    });

    it('clamps durations to valid bounds (min 15, max 240)', async () => {
      const resShort = await provider.extractIntent('5 minutes');
      expect(resShort.durationMinutes).toBe(15);

      const resLong = await provider.extractIntent('500 minutes');
      expect(resLong.durationMinutes).toBe(240);
    });
  });

  describe('Budget parsing', () => {
    it('detects free requests', async () => {
      const res1 = await provider.extractIntent("I don't want to spend money");
      expect(res1.budget).toBe('free');

      const res2 = await provider.extractIntent('I am broke and need free activity');
      expect(res2.budget).toBe('free');

      const res3 = await provider.extractIntent('$0 budget for today');
      expect(res3.budget).toBe('free');
    });

    it('detects low-cost requests if cafe/coffee mentioned', async () => {
      const res = await provider.extractIntent('Walk to a cafe to grab a coffee');
      expect(res.budget).toBe('low-cost');
    });
  });

  describe('Energy and Mood parsing', () => {
    it('detects tired/low energy', async () => {
      const res = await provider.extractIntent("I have 2 hours, I'm tired, and I don't want anything expensive.");
      expect(res.energyLevel).toBe('low');
      expect(res.mood).toBe('tired');
      expect(res.budget).toBe('free');
    });

    it('detects stress and need to clear head', async () => {
      const res = await provider.extractIntent('I have 45 minutes and need to clear my head.');
      expect(res.mood).toBe('stressed');
      expect(res.durationMinutes).toBe(45);
    });

    it('detects high energy and active intents', async () => {
      const res = await provider.extractIntent('I want something active and high energy this evening.');
      expect(res.energyLevel).toBe('high');
      expect(res.timeOfDay).toBe('evening');
    });
  });

  describe('Social and Activity parsing', () => {
    it('detects friends preference', async () => {
      const res = await provider.extractIntent('Plan something fun with two friends.');
      expect(res.socialPreference).toBe('friends');
      expect(res.mood).toBe('social');
    });

    it('detects solo preference', async () => {
      const res = await provider.extractIntent('Just by myself, quiet walk');
      expect(res.socialPreference).toBe('solo');
      expect(res.activityPreference).toBe('walking');
    });

    it('detects jogging or cycling activity', async () => {
      const resJog = await provider.extractIntent('Go for a trail run');
      expect(resJog.activityPreference).toBe('jogging');

      const resBike = await provider.extractIntent('Go for a bike ride');
      expect(resBike.activityPreference).toBe('cycling');
    });
  });
});
