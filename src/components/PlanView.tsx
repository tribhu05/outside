import React from 'react';
import { OutdoorPlan } from '../types';
import { Icon } from './Icon';
import { 
  ArrowLeft, 
  Clock, 
  BatteryCharging, 
  DollarSign, 
  Users, 
  Sparkles, 
  Shuffle, 
  CheckCircle2 
} from 'lucide-react';

interface PlanViewProps {
  plan: OutdoorPlan;
  onStartSession: () => void;
  onBackToInput: () => void;
  onShuffleChallenge: () => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  plan,
  onStartSession,
  onBackToInput,
  onShuffleChallenge
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Top navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToInput}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Request</span>
        </button>

        {/* AI provenance tag */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300">
          <span className={`w-1.5 h-1.5 rounded-full ${plan.providerUsed === 'gemma' ? 'bg-emerald-500' : 'bg-stone-400'}`} />
          <span>{plan.providerUsed === 'gemma' ? 'Parsed with Gemma' : 'Deterministic Engine'}</span>
        </div>
      </div>

      {/* Plan Header Card */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex items-center gap-2 text-nature-700 dark:text-nature-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Your Outside Plan</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 mb-2">
          {plan.title}
        </h1>
        <p className="text-stone-700 dark:text-stone-300 text-sm sm:text-base mb-6 leading-relaxed">
          {plan.tagline}
        </p>

        {/* Structured badges */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-stone-100 dark:border-stone-850">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            {plan.totalDurationMinutes} min total
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 capitalize">
            <BatteryCharging className="w-3.5 h-3.5 text-stone-500" />
            {plan.energyLevel} energy
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 capitalize">
            <DollarSign className="w-3.5 h-3.5 text-stone-500" />
            {plan.budget === 'free' ? 'No cost' : 'Low cost'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 capitalize">
            <Users className="w-3.5 h-3.5 text-stone-500" />
            {plan.socialMode}
          </span>
        </div>
      </div>

      {/* Step by Step Timeline */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-4 px-1">
          Timeline & Schedule
        </h2>

        <div className="space-y-3">
          {plan.milestones.map((milestone) => {
            return (
              <div 
                key={milestone.id}
                className="relative flex items-start gap-3.5 sm:gap-4 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-stone-900 shadow-sm transition-all"
              >
                {/* Time Badge */}
                <div className="flex-shrink-0 text-right w-16 sm:w-20 pt-0.5">
                  <div className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {milestone.timeLabel}
                  </div>
                  {milestone.durationMinutes > 0 && (
                    <div className="text-[11px] text-stone-600 dark:text-stone-400">
                      {milestone.durationMinutes} min
                    </div>
                  )}
                </div>

                {/* Milestone Node */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-nature-100 dark:bg-nature-950/80 text-nature-800 dark:text-nature-300 border border-nature-200 dark:border-nature-800 flex items-center justify-center mt-0.5">
                  <Icon name={milestone.iconName} className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-0.5">
                    {milestone.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed mb-1">
                    {milestone.description}
                  </p>
                  {milestone.actionGuidance && (
                    <p className="text-xs text-nature-700 dark:text-nature-400 font-medium">
                      Tip: {milestone.actionGuidance}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Challenge Card */}
      {plan.challenge && (
        <div className="rounded-2xl border border-nature-200 dark:border-nature-900/60 bg-nature-50/60 dark:bg-nature-950/40 p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-nature-800 dark:text-nature-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-nature-600 dark:text-nature-400" />
              <span>Challenge Me</span>
            </div>
            <button
              onClick={onShuffleChallenge}
              className="inline-flex items-center gap-1 text-xs text-nature-700 dark:text-nature-400 hover:text-nature-900 dark:hover:text-nature-200 font-medium"
              title="Shuffle challenge"
            >
              <Shuffle className="w-3 h-3" />
              <span>Shuffle</span>
            </button>
          </div>

          <h3 className="font-semibold text-base text-stone-900 dark:text-stone-100 mb-1">
            {plan.challenge.title}
          </h3>
          <p className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed">
            {plan.challenge.instruction}
          </p>
        </div>
      )}

      {/* Preparation checklist */}
      {plan.preparationTips.length > 0 && (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 p-5 mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
            <span>Before Stepping Out</span>
          </h3>
          <ul className="space-y-1.5">
            {plan.preparationTips.map((tip, i) => (
              <li key={i} className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-nature-600 dark:bg-nature-400 flex-shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary Action Button */}
      <div className="sticky bottom-4 z-10 pt-2">
        <div className="p-4 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200 dark:border-stone-800 shadow-lg text-center">
          <button
            onClick={onStartSession}
            className="w-full py-3.5 px-6 rounded-xl font-medium text-base text-white bg-nature-700 hover:bg-nature-800 dark:bg-nature-600 dark:hover:bg-nature-500 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-nature-500 flex items-center justify-center gap-2"
          >
            <span>Start Outside Time 🌿</span>
          </button>
          <p className="text-xs text-stone-700 dark:text-stone-300 mt-2 font-serif italic">
            Transitions into Screen Exit mode. Put your phone away when you step outside.
          </p>
        </div>
      </div>
    </div>
  );
};
