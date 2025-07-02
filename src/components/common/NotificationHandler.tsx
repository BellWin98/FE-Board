import useNotifications from "../../hooks/useNotifications";

// 이 컴포넌트는 UI를 렌더링 하지 않고, useNotification 훅을 실행하는 역할만 수행
const NotificationHandler = () => {
    useNotifications();
    return null;
}

export default NotificationHandler;