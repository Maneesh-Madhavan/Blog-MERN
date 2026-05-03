import { createContext, useState, useEffect } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      // If profile takes >5s just unblock UI
      setLoading(false);
    }, 5000);

    const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, "");
    fetch(`${baseUrl}/profile`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then(data => {
        setUserInfo(data);
        setLoading(false);
        clearTimeout(timeout);
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          setUserInfo(null);
          setLoading(false);
          clearTimeout(timeout);
        }
      });

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo, loading }}>
      {children}
    </UserContext.Provider>
  );
}
