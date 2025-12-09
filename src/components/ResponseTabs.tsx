'use client';

import { useState } from 'react';
import { LLMResponse, ReviewResponse } from '@/lib/types';

interface ResponseTabsProps {
  responses: LLMResponse[];
  reviews: ReviewResponse[];
}

export default function ResponseTabs({ responses, reviews }: ResponseTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const getAverageRank = (modelId: string): number => {
    const ranks: number[] = [];

    reviews.forEach(review => {
      review.rankings.forEach(ranking => {
        const originalModelName = (ranking as any).originalModelName;
        const targetResponse = responses.find(r => r.modelName === originalModelName);
        if (targetResponse && targetResponse.modelId === modelId) {
          ranks.push(ranking.rank);
        }
      });
    });

    if (ranks.length === 0) return 0;
    return ranks.reduce((a, b) => a + b, 0) / ranks.length;
  };

  // Sort responses by average rank
  const sortedResponses = [...responses].sort((a, b) => {
    const avgRankA = getAverageRank(a.modelId);
    const avgRankB = getAverageRank(b.modelId);
    if (avgRankA === 0) return 1;
    if (avgRankB === 0) return -1;
    return avgRankA - avgRankB;
  });

  const activeResponse = sortedResponses[activeTab];

  // Get reviews for active response
  const getReviewsForResponse = (modelId: string) => {
    const reviewList: Array<{ reviewer: string; rank: number; reasoning: string }> = [];

    reviews.forEach(review => {
      review.rankings.forEach(ranking => {
        const originalModelName = (ranking as any).originalModelName;
        const targetResponse = responses.find(r => r.modelName === originalModelName);
        if (targetResponse && targetResponse.modelId === modelId) {
          reviewList.push({
            reviewer: review.reviewerName,
            rank: ranking.rank,
            reasoning: ranking.reasoning,
          });
        }
      });
    });

    return reviewList;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Individual Committee Responses</h3>
              <p className="text-xs text-gray-600 mt-0.5">Click tabs to explore each model's perspective</p>
            </div>
          </div>
        </div>
        <div className="flex overflow-x-auto px-6 scrollbar-thin scrollbar-thumb-gray-300">
          {sortedResponses.map((response, index) => {
            const avgRank = getAverageRank(response.modelId);
            const isActive = activeTab === index;
            return (
              <button
                key={response.modelId}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-3 transition-all duration-200 ${
                  isActive
                    ? 'border-primary-600 text-primary-700 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{response.modelName}</span>
                  {avgRank > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                      #{avgRank.toFixed(1)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-8">
        {/* Response Content */}
        <div className="mb-8">
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {activeResponse.response}
            </div>
          </div>
        </div>

        {/* Peer Reviews */}
        {reviews.length > 0 && getReviewsForResponse(activeResponse.modelId).length > 0 && (
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900">Peer Reviews</h4>
            </div>
            <div className="grid gap-4">
              {getReviewsForResponse(activeResponse.modelId).map((review, idx) => (
                <div key={idx} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                        {review.reviewer.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{review.reviewer}</span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getRankBadgeColor(review.rank)}`}>
                      Rank #{review.rank}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed pl-11">{review.reasoning}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
