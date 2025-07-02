import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef } from "react";
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from "sockjs-client";
import type { NotificationMessage } from "../types/models";
import { toast } from "react-toastify";

const API_WS_URL = import.meta.env.VITE_API_WS_URL || 'http://localhost:8080';
const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
};

export const useNotifications = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (isAuthenticated && user) {
            // 이미 연결된 경우 중복 연결 방지
            if (stompClientRef.current && stompClientRef.current.active) {
                return;
            }

            const token = getAuthToken();

            // Stomp 클라이언트 생성
            const client = new Client({
                webSocketFactory: () => {
                    // SockJS를 WebSocket처럼 사용
                    return new SockJS(`${API_WS_URL}/wss`);
                },
                connectHeaders: {
                    Authorization: `Bearer ${token}`
                },
                debug: (str) => {
                    console.log(new Date(), str); // 개발 중 디버깅에 유용
                },
                reconnectDelay: 5000, // 5초 후 재연결 시도
                onConnect: () => {
                    console.log('WebSocket 연결 성공!');

                    // 사용자의 개인 알림 채널 구독
                    client.subscribe(`/user/${user.id}/notifications`, (message: IMessage) => {
                        const notification: NotificationMessage = JSON.parse(message.body);
                        console.log('새 알림 수신: ', notification);

                        // 토스트 알림 표시
                        toast.info(notification.content, {
                            onClick: () => {
                                if (notification.url) {
                                    navigate(notification.url);
                                }
                            },
                            autoClose: 5000, // 7초 후 자동 닫힘
                            position: 'top-right'
                        });
                    });
                },
                onStompError: (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    console.error('Additional details: ' + frame.body);
                },
                onDisconnect: () => {
                    console.log('WebSocket 연결 해제됨');
                }
            });

            // 클라이언트 활성화
            client.activate();
            stompClientRef.current = client;
        } else {
            // 로그아웃 시 연결 해제
            if (stompClientRef.current && stompClientRef.current.active) {
                stompClientRef.current.deactivate();
                stompClientRef.current = null;
                console.log('로그아웃으로 WebSocket 연결 해제');
            }
        }

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (stompClientRef.current && stompClientRef.current.active) {
                stompClientRef.current.deactivate();
                console.log('컴포넌트 언마운트로 WebSocket 연결 해제');
            }
        };
    }, [isAuthenticated, user, navigate]);
};

export default useNotifications;