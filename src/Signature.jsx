import styles from "./Signature.module.css";
import CanvasComponent from "./CanvasComponent";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
function Signature() {
  const { data } = useLocation().state;

  const [patientData, setPatientData] = useState(null);

  const handlePatientChange = (event) => {
    const selectedSno = event.target.value;
    console.log(selectedSno);
    console.log(data);
    const selectedPatient = data.find(
      (patient) => patient.sno === parseInt(selectedSno)
    );
    console.log(selectedPatient);
    setPatientData(selectedPatient);
  };

  const [currentTime, setCurrentTime] = useState(new Date());


  useEffect(() => {
    setPatientData(data[0]);
  }, []);
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const submitHandler = (event) => {
    event.preventDefault();
  };

  return (
    <section>
      <nav className={styles.nav}>
       
        <section className={styles.selectPatient}>
          <h1>Select Patient:</h1>
          <select name="patient" id="patient" onChange={handlePatientChange}>
            {data.map((set) => (
              <option key={set.sno} value={set.sno}>
                {set.sno}:{set.patient_name}
              </option>
            ))}
          </select>
        </section>
        <p className={styles.time}>{currentTime.toLocaleString()}</p>
      </nav>
      

      <section onSubmit={submitHandler} className={styles.form}>
        <div className={styles.patientDetails}>
          <span className={styles.detail}>
            <p className={styles.detailTitle}>UHID:</p>
            <p className={styles.detailValue}>
              {patientData ? patientData.sno : data[0].sno}
            </p>
          </span>
          <span className={styles.detail}>
            <p className={styles.detailTitle}>Name:</p>
            <p className={`${styles.detailValue}  ${styles.name}`}>
              {patientData ? patientData.patient_name : data[0].patient_name}
            </p>
          </span>
        </div>
        <CanvasComponent data={patientData}/>

        <h2 className={styles.disclaimer} id="disclaimer"  style={{color:"Black", fontWeight:'900'}}>
          *Disclaimer: This Signature Is Used For Hospital Purposes Only
        </h2>
      </section>
    </section>
  );
}

export default Signature;
