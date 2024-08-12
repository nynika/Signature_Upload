import React, { useRef, useState, useEffect } from "react";
import styles from "./CanvasComponent.module.css";
import { useNavigate } from "react-router-dom";
import { notification, Modal } from "antd";
const CanvasComponent = (props) => {

  const navigate = useNavigate();
  const redirect = () => {
    Modal.success({
      title: "*Signature Updated Successfully",
  
      okButtonProps: {
        style: {
          backgroundColor: "#087f5b",
          hoverBackgroundColor: "#087f5b",
          borderColor: "#087f5b",
          hoverBorderColor: "#087f5b",
          color: "white",
          activeBackgroundColor: "#087f5b",
          activeBorderColor: "#087f5b",
        },
      },
      okText: "Okay",
      onOk: () => {
        navigate("/");
      },
    });
  };

  const APIerror = () => {
    Modal.error({
      title: "*Failed To Send Data",
      content: "Please Try Again...",
      okButtonProps: {
        style: {
          backgroundColor: "#087f5b",
          hoverBackgroundColor: "#087f5b",
          borderColor: "#087f5b",
          hoverBorderColor: "#087f5b",
          color: "white",
          activeBackgroundColor: "#087f5b",
          activeBorderColor: "#087f5b",
        },
      },
      okText: "Okay",
      onOk: () => {
        window.location.reload();
      },
    });
  };

  /* Modal */
  /*toast notification  */
  const [canvasApi, canvasContextHolder] = notification.useNotification();

  const displayCanvasErr = (placement, message) => {
    canvasApi.warning({
      message: `${message}`,

      placement,
    });
  };

  /*toast notification  */

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const canvasRef = useRef(null);

  const [relationshipTypes, setRelationshipTypes] = useState([]);
  const [selectedRelationshipType, setSelectedRelationshipType] = useState("");
  const [relationshipName, setRelationshipName] = useState("");

  useEffect(() => {
    // Fetch Relationship Types
    fetch("http://192.168.15.3/NewHIS/api/his/Signature_PatientRelation")
      .then((response) => response.json())
      .then((data) => {
        setRelationshipTypes(data); // assuming data is an array of relationship types
        if (data.length > 0) {
          setSelectedRelationshipType(data[0].relationshipType); // set default to first option's code
        }
      })
      .catch((error) =>
        console.error("Error fetching relationship types:", error)
      );
  }, []);

  function isCanvasEmpty(canvas) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let i = 0; i < imageData.length; i += 4) {
      const red = imageData[i];
      const green = imageData[i + 1];
      const blue = imageData[i + 2];
      const alpha = imageData[i + 3];

      if (alpha !== 0 && (red !== 255 || green !== 255 || blue !== 255)) {
        return false;
      }
    }

    return true;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    //const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Draw white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stroke
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    if (e.type === "mousedown" || e.type === "touchstart") {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
    }

    if (e.type === "mousemove" || e.type === "touchmove") {
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    setLastX(x);
    setLastY(y);
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLastX(x);
    setLastY(y);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseOut = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    setLastX(x);
    setLastY(y);
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  const handleTouchCancel = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 255, 255, 255)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.stroke();
  };

  const handleSubmit = async (event) => {
    console.log(props);
    event.preventDefault();
    // Add submit logic
    const canvas = canvasRef.current;

    if (isCanvasEmpty(canvas)) {
      displayCanvasErr("top", "Please Enter Your Sign");
      return;
    }

    // Check if a relationship type is selected
    if (!selectedRelationshipType) {
      displayCanvasErr("top", "Please select a relationship type.");
      return; 
    }
  
    // Check if the relationship name is provided if the selected type is not "Self"
    if (selectedRelationshipType !== "Self" && !relationshipName.trim()) {
      displayCanvasErr("top", "Please enter relationship name.");
      return; 
    }
  

    const data = {
      UHID: props.data.sno,
      PatientName: props.data.patient_name,
      MobileNo: props.data.patient_mobilenumber,
      DocumentName: `${props.data.sno}_sign`,
      DocumentPath: `${props.data.sno}`,
      RelationshipType: selectedRelationshipType,
      RelationshipName: relationshipName,
    };

    const desiredWidth = 220;
    const desiredHeight = 100;
    const aspectRatio = 862 / 478;

    const widthPx = Math.round(desiredWidth * aspectRatio);
    const heightPx = Math.round(desiredHeight * aspectRatio);

    const base64String = await new Promise((resolve) => {
      const img = new Image();
      img.src = canvas.toDataURL("image/png");
      img.onload = () => {
        const resizedCanvas = document.createElement("canvas");
        const resizedContext = resizedCanvas.getContext("2d");

        resizedCanvas.width = widthPx;
        resizedCanvas.height = heightPx;

        // Fill resized canvas with white background
        resizedContext.fillStyle = "white";
        resizedContext.fillRect(0, 0, widthPx, heightPx);

        resizedContext.drawImage(img, 0, 0, widthPx, heightPx);
        resolve(resizedCanvas.toDataURL("image/png"));
      };
    });

    const sizeInBytes = (base64String.length * (3 / 4)) - (base64String.includes('==') ? 2 : base64String.includes('=') ? 1 : 0);
    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInMB > 10) {
      displayCanvasErr(
        "top",
        "Signature exceeded 10 MB. Please enter a shorter signature"
      );
      return;
    }
    
    data.img = base64String;

    fetch("http://192.168.15.3/NewHIS/api/his/import_v1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.status === 200) {
          redirect();
        } else {
          APIerror();
        }
      })
      .catch((error) => {
        APIerror();
      });
  };

  const handleLogout = () => {
    navigate("/");
  };


  return (
    <div className={styles.canvasContainer}>
      <div className={styles.relationshipContainer}>
        <label htmlFor="relationshipType">Relationship Type:</label>

        <select
            id="relationshipType"
            value={selectedRelationshipType}
            onChange={(e) => {
              const selectedValue = e.target.value;
              setSelectedRelationshipType(selectedValue);
              if (selectedValue === "Self") {
                setRelationshipName(""); 
              }
            }}
            required>

          {relationshipTypes.map((type) => (
            <option key={type.relationshipCode} value={type.relationshipType}>
              {type.relationshipType}
            </option>
          ))}
        </select>
        <label htmlFor="relationshipName">Relationship Name:</label>


          <input
          id="relationshipName"
          type="text"
          value={relationshipName}
          onChange={(e) => setRelationshipName(e.target.value)}
          disabled={selectedRelationshipType === "Self"} // Keep this as is
          placeholder="Enter Relationship Name"/>
          </div>

      {canvasContextHolder}
      <form onSubmit={handleSubmit}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ border: "1px solid black", touchAction: "none" }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={draw}
          onMouseOut={handleMouseOut}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={draw}
          onTouchCancel={handleTouchCancel}
        ></canvas>

        <div className={styles.formButtons}>
          <button
            type="button"
            className={`${styles.button} ${styles.clear}`}
            onClick={handleClear}
          >
            Clear
          </button>
          <button type="submit" className={`${styles.button} ${styles.submit}`}>
            Submit
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.logout}`}
            onClick={handleLogout}>
            Logout
          </button>
        </div>
      </form>
    </div>
  );
};

export default CanvasComponent;






