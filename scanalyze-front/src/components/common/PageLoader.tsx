// PageLoader — full-screen animated loading overlay
// Displayed while the app is initializing or navigating between pages
import { Box, keyframes } from "@mui/material";
import { colors } from "@theme";
 
const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.85); }
`;
 
const scanLine = keyframes`
  0%   { top: 0%;   opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
`;
 
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;
 
export default function PageLoader() {
  return (
    <Box
      sx={{
        position:       "fixed",
        inset:          0,
        zIndex:         9999,
        bgcolor:        colors.bgPage,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        animation:      `${fadeIn} 0.15s ease`,
      }}
    >
      <Box sx={{ position: "relative", mb: 4 }}>
 
        {/* Outer ring — clips the scan line */}
        <Box
          sx={{
            width:          90,
            height:         90,
            borderRadius:   "50%",
            border:         `1px solid ${colors.blueButton}44`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            position:       "relative",
            overflow:       "hidden",
          }}
        >
          {/* Scan line */}
          <Box
            sx={{
              position:   "absolute",
              left:       0,
              right:      0,
              height:     "2px",
              background: `linear-gradient(90deg, transparent, ${colors.blue}, transparent)`,
              animation:  `${scanLine} 1.6s ease-in-out infinite`,
              boxShadow:  `0 0 8px ${colors.blue}`,
            }}
          />
 
          {/* Inner circle */}
          <Box
            sx={{
              width:          60,
              height:         60,
              borderRadius:   "50%",
              border:         `2px solid ${colors.blueButton}`,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              bgcolor:        colors.bgPage,
            }}
          >
            {/* Scanalyze "S" logo — pulses while loading */}
            <Box
              sx={{
                width:     28,
                height:    28,
                position:  "relative",
                animation: `${pulse} 1.6s ease-in-out infinite`,
              }}
            >
              <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4"  y="4"  width="20" height="4" rx="2" fill={colors.blue} />
                <rect x="4"  y="4"  width="4"  height="12" rx="2" fill={colors.blue} />
                <rect x="4"  y="12" width="20" height="4" rx="2" fill={colors.blueMuted} />
                <rect x="20" y="12" width="4"  height="12" rx="2" fill={colors.blue} />
                <rect x="4"  y="20" width="20" height="4" rx="2" fill={colors.blue} />
              </svg>
            </Box>
          </Box>
        </Box>
 
        {/* Orbiting dot */}
        <Box
          sx={{
            position:    "absolute",
            top:         "50%",
            left:        "50%",
            width:       90,
            height:      90,
            marginTop:   "-45px",
            marginLeft:  "-45px",
            borderRadius: "50%",
            border:       "1px solid transparent",
            borderTopColor: colors.blue,
            animation:    "spin 1s linear infinite",
            "@keyframes spin": {
              "0%":   { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      </Box>
 
      {/* Three pulsing dots */}
      <Box sx={{ display: "flex", gap: 1 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width:           6,
              height:          6,
              borderRadius:    "50%",
              bgcolor:         colors.blue,
              animation:       `${pulse} 1.2s ease-in-out infinite`,
              animationDelay:  `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}