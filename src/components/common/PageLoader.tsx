import { Box, keyframes } from "@mui/material";

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
`;

const scanLine = keyframes`
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
`;
//animation d'apparaition
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export default function PageLoader() {
  return (
    //un overlay plin d'ecran sombre qui recouvre toute l'app 
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        bgcolor: "#080f1e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        animation: `${fadeIn} 0.15s ease`,
      }}
    >
      {/* Logo + scan effect */}
      <Box sx={{ position: "relative", mb: 4 }}>
        {/* Outer ring */}
        <Box
          sx={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            border: "1px solid #1e40af44",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Scan line : une ligne bleue qui descend en boucle de hout en bas avec un effet de lueur */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
              animation: `${scanLine} 1.6s ease-in-out infinite`,
              boxShadow: "0 0 8px #3b82f6",
            }}
          />

          {/* Inner circle : un cercle interieur qui contient le logo SVG */}
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "2px solid #1e40af",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#0f172a",
            }}
          >
            {/* Scanalyze "S" logo shape */}
            <Box
              sx={{
                width: 28,
                height: 28,
                position: "relative",
                animation: `${pulse} 1.6s ease-in-out infinite`,
              }}
            >
              <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="20" height="4" rx="2" fill="#3b82f6" />
                <rect x="4" y="4" width="4" height="12" rx="2" fill="#3b82f6" />
                <rect x="4" y="12" width="20" height="4" rx="2" fill="#60a5fa" />
                <rect x="20" y="12" width="4" height="12" rx="2" fill="#3b82f6" />
                <rect x="4" y="20" width="20" height="4" rx="2" fill="#3b82f6" />
              </svg>
            </Box>
          </Box>
        </Box>

        {/* Orbiting dot : un cercle avec un seul coté coloré crée l'effet d'un point qui orbite autour de logo */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 90,
            height: 90,
            marginTop: "-45px",
            marginLeft: "-45px",
            borderRadius: "50%",
            border: "1px solid transparent",
            borderTopColor: "#3b82f6",
            animation: "spin 1s linear infinite",
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      </Box>

      {/* Dots : 3 pt cercles bleues qui pulsent en cascade  */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#3b82f6",
              animation: `${pulse} 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
