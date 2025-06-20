
import apiClient from './api';
import type { 
  Challenge, 
  ChallengeParticipant, 
  ChallengeProgress,
  CreateChallengeRequest,
  JoinChallengeRequest,
  SubmitProgressRequest,
  VerifyProgressRequest,
  PageResponse 
} from '../types/models';

export const challengeService = {
  // 챌린지 목록 조회
  async getChallenges(
    page: number = 0, 
    size: number = 20, 
    category?: string,
    status?: string
  ): Promise<PageResponse<Challenge>> {
    const response = await apiClient.get<PageResponse<Challenge>>('/challenges', {
      params: { page, size, category, status }
    });
    return response.data;
  },

  // 내 챌린지 목록 조회
  async getMyChallenges(page: number = 0, size: number = 20): Promise<PageResponse<Challenge>> {
    const response = await apiClient.get<PageResponse<Challenge>>('/challenges/my', {
      params: { page, size }
    });
    return response.data;
  },

  // 챌린지 상세 조회
  async getChallenge(challengeId: number): Promise<Challenge> {
    const response = await apiClient.get<Challenge>(`/challenges/${challengeId}`);
    return response.data;
  },

  // 챌린지 생성
  async createChallenge(challengeData: CreateChallengeRequest): Promise<Challenge> {
    const response = await apiClient.post<Challenge>('/challenges', challengeData);
    return response.data;
  },

  // 챌린지 참가
  async joinChallenge(request: JoinChallengeRequest): Promise<ChallengeParticipant> {
    const response = await apiClient.post<ChallengeParticipant>(
      `/challenges/${request.challengeId}/join`, 
      { betAmount: request.betAmount }
    );
    return response.data;
  },

  // 챌린지 나가기
  async leaveChallenge(challengeId: number): Promise<void> {
    await apiClient.delete(`/challenges/${challengeId}/leave`);
  },

  // 챌린지 진행상황 제출
  async submitProgress(request: SubmitProgressRequest): Promise<ChallengeProgress> {
    const response = await apiClient.post<ChallengeProgress>(
      `/challenges/${request.challengeId}/progress`,
      {
        completed: request.completed,
        proof: request.proof
      }
    );
    return response.data;
  },

  // 챌린지 진행상황 조회
  async getChallengeProgress(challengeId: number): Promise<ChallengeProgress[]> {
    const response = await apiClient.get<ChallengeProgress[]>(
      `/challenges/${challengeId}/progress`
    );
    return response.data;
  },

  // 진행상황 검증
  async verifyProgress(request: VerifyProgressRequest): Promise<ChallengeProgress> {
    const response = await apiClient.put<ChallengeProgress>(
      `/challenges/progress/${request.progressId}/verify`,
      {
        verified: request.verified,
        comment: request.comment
      }
    );
    return response.data;
  },

  // 챌린지 완료 처리
  async completeChallenge(challengeId: number): Promise<Challenge> {
    const response = await apiClient.put<Challenge>(`/challenges/${challengeId}/complete`);
    return response.data;
  },

  // 챌린지 취소
  async cancelChallenge(challengeId: number): Promise<Challenge> {
    const response = await apiClient.put<Challenge>(`/challenges/${challengeId}/cancel`);
    return response.data;
  }
};

export default challengeService;
