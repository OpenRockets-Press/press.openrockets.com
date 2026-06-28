import { PublishLayout } from "@/components/publish/PublishLayout";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api";
import { getSessionUser } from "@/lib/authStore";
import { queryKeys } from "@/lib/queryKeys";

export function ProfilePage() {
  const { data: user } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: () => getCurrentUser(),
    initialData: () => getSessionUser() ?? undefined,
  });

  const getAvatarUrl = () => {
    if (user?.displayName) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=0D8A50&color=fff&size=256`;
    }
    return `https://ui-avatars.com/api/?name=User&background=0D8A50&color=fff&size=256`;
  };

  const displayName = user?.displayName || "OpenRockets User";
  const displayEmail = user?.email || "user@openrockets.com";
  const displayBirthday = "11th of March"; // Natural language fallback

  return (
    <PublishLayout>
      <div 
        className="publish-step-container"
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "70vh",
          padding: "1rem 0",
          width: "100%",
          alignItems: "flex-start",
        }}
      >
        <div style={{
          width: "100%",
          border: "1px solid #000",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#faf8f0",
        }}>
          {/* Header Row */}
          <div className="sidebar-header" style={{ margin: 0, borderRadius: 0, borderBottom: "1px solid #000" }}>
            <div className="sidebar-header-left">
              <img 
                src={getAvatarUrl()} 
                alt="Profile Icon" 
                className="sidebar-book-icon"
                style={{ borderRadius: "50%" }}
              />
              <h3 style={{ fontFamily: "Ubuntu, sans-serif", fontSize: "16px", fontWeight: "bold" }}>
                Profile
              </h3>
            </div>
            <button 
              className="ads-modal-close-btn"
              style={{ fontFamily: "Ubuntu, sans-serif" }}
            >
              Sign out
            </button>
          </div>

          <div style={{ width: "100%", position: "relative" }}>
            {/* Banner Image */}
            <div style={{
              width: "100%",
              height: "180px",
              backgroundImage: "url(/brand/banner.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "#eaeaea",
            }} />

            {/* Profile Content Container */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "0 24px 24px 24px",
              marginTop: "-60px",
              position: "relative",
              zIndex: 10
            }}>
              {/* Avatar overlapping banner */}
              <img 
                src={getAvatarUrl()} 
                alt="Profile" 
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  border: "4px solid #faf8f0",
                  backgroundColor: "#faf8f0",
                  objectFit: "cover",
                  marginBottom: "1.5rem"
                }} 
              />

              {/* Name */}
              <h1 style={{
                fontSize: "2.2rem",
                fontWeight: "bold",
                color: "#111",
                margin: "0 0 1.5rem 0",
                fontFamily: "Ubuntu, sans-serif"
              }}>
                {displayName}
              </h1>

              {/* Info Row (Birthday and Email) */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                width: "100%"
              }}>
                {/* Birthday Row */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <img 
                    src="/brand/birthday-icon.png" 
                    alt="Birthday" 
                    style={{ width: "24px", height: "24px", objectFit: "contain" }} 
                  />
                  <span style={{ fontSize: "1.1rem", color: "#111", fontWeight: "500", fontFamily: "Ubuntu, sans-serif" }}>
                    {displayBirthday}
                  </span>
                </div>

                {/* Email Row */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}>
                  <img 
                    src="/brand/email-icon.png" 
                    alt="Email" 
                    style={{ width: "24px", height: "24px", objectFit: "contain" }} 
                  />
                  <span style={{ fontSize: "1.1rem", color: "#111", fontWeight: "500", fontFamily: "Ubuntu, sans-serif" }}>
                    {displayEmail}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublishLayout>
  );
}
