import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateCropSuitability } from '../../data/agriculture/crops';
import { FARMING_PRACTICES_GUIDANCE, getWaterGuidance } from '../../data/agriculture/knowledge';
import { Sprout, Droplets, ChevronDown, ChevronUp, Info, MessageSquare } from 'lucide-react';
import { t } from '../../utils/translations';

export const CropAdviceView: React.FC = () => {
  const { farmContext, weatherData, setActiveTab, language } = useApp();
  const [expandedCrop, setExpandedCrop] = useState<string | null>(null);

  const recommendations = calculateCropSuitability(farmContext);

  const rain7Day = weatherData ? weatherData.daily.reduce((acc, curr) => acc + curr.precipitationSum, 0) : 15;
  const waterStatus = getWaterGuidance(rain7Day, farmContext.water);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-10">
      {/* Header */}
      <div className="bg-white border border-stone-300 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
              {t('agronomicDecisionSupport', language)}
            </span>
            <h2 className="text-2xl font-bold text-emerald-950 font-display mt-1 flex items-center gap-2">
              <Sprout className="w-6 h-6 text-emerald-800" />
              {t('cropAdviceTitle', language)}
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              {t('cropAdviceSub', language)}
            </p>
          </div>

          <div className="text-xs text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-300">
            {t('activeContext', language)} <strong>{farmContext.season} · {farmContext.soil}</strong>
          </div>
        </div>

        {/* Mandatory Disclaimer */}
        <div className="p-3 bg-stone-100 border border-stone-300 rounded-xl text-xs text-stone-700 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-950">{t('disclaimerTitle', language)}</strong>
            <span className="ml-1">
              {t('disclaimerText', language)}
            </span>
          </div>
        </div>
      </div>

      {/* Water Guidance Section */}
      <div className="bg-white border border-stone-300 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-emerald-950 font-display text-lg">
          <Droplets className="w-5 h-5 text-blue-600" />
          {t('waterOutlookTitle', language)}
        </div>

        <div className={`p-4 rounded-xl border space-y-2 ${
          waterStatus.level === 'GOOD' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
          waterStatus.level === 'MODERATE' ? 'bg-amber-50 border-amber-200 text-amber-950' :
          'bg-rose-50 border-rose-200 text-rose-950'
        }`}>
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm">{waterStatus.title}</h4>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/80 shadow-2xs">
              Status: {waterStatus.level}
            </span>
          </div>
          <p className="text-xs leading-relaxed">{waterStatus.description}</p>
          <ul className="list-disc pl-4 space-y-1 text-xs pt-1">
            {waterStatus.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Crop Recommendations Grid */}
      <div className="bg-white border border-stone-300 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-emerald-950 font-display text-lg">
            {t('suitableCropsTitle', language)}
          </h3>
          <p className="text-xs text-stone-500">
            {t('suitableCropsSub', language)} ({farmContext.season}, {farmContext.soil}, {farmContext.water})
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => {
            const isExpanded = expandedCrop === rec.crop;
            return (
              <div
                key={rec.crop}
                className="bg-stone-50 border border-stone-300 rounded-2xl p-5 flex flex-col justify-between space-y-3 hover:border-emerald-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      {t('agronomicFit', language)}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {rec.suitabilityLabel}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold font-display text-emerald-950 mt-1">
                    {rec.crop}
                  </h4>

                  <div className="mt-3 space-y-1.5 text-xs text-stone-700">
                    <div className="font-bold text-emerald-950 mb-1">{t('suitableBecause', language)}</div>
                    {rec.reasons.map((r, i) => (
                      <div key={i}>• {r}</div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      onClick={() => setExpandedCrop(isExpanded ? null : rec.crop)}
                      className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>{isExpanded ? t('hideReasoning', language) : t('viewReasoning', language)}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => setActiveTab('aichat')}
                      className="text-stone-700 hover:text-emerald-950 font-medium flex items-center gap-1 text-[11px]"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-700" />
                      <span>{t('askAiPlan', language)}</span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-3 bg-white rounded-xl text-xs text-stone-700 space-y-2 border border-stone-300 animate-in fade-in duration-150">
                      <div><strong>{t('waterReq', language)}</strong> {rec.waterReq}</div>
                      <div><strong>{t('cropDuration', language)}</strong> {rec.duration}</div>
                      <div><strong>{t('soilFit', language)}</strong> {rec.soilFit}</div>
                      <div className="pt-1 text-amber-900 bg-amber-50 p-2 rounded border border-amber-200 text-[11px]">
                        <strong>{t('importantConsideration', language)}</strong> {rec.caveats[0]}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Farming Practices */}
      <div className="bg-white border border-stone-300 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-emerald-950 font-display text-lg">
            {t('practicalGuidanceTitle', language)}
          </h3>
          <p className="text-xs text-stone-500">
            {t('practicalGuidanceSub', language)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FARMING_PRACTICES_GUIDANCE.map((practice, idx) => (
            <div key={idx} className="p-4 bg-stone-50 border border-stone-300 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-emerald-950">{practice.topic}</h4>
                <span className="text-[10px] font-mono bg-stone-200 px-2 py-0.5 rounded text-stone-700">
                  {practice.category}
                </span>
              </div>
              <p className="text-xs text-stone-600">{practice.summary}</p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-stone-700 pt-1">
                {practice.actionPoints.map((ap, i) => (
                  <li key={i}>{ap}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
