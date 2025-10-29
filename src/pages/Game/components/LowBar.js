// arrow: function funcion q almacena el componente
import styles from './LowBar.module.css'

export const Lowbar = ({dinero, onSpin, onStartAutoSpin, onStopAutoSpin}) => {
    return(
        //  contenedores
        <div className={styles.contenedor}>
            <div className={styles.botonesIzq}>
                <button onClick={onStopAutoSpin}>stop</button>
                <button onClick={onStartAutoSpin}>auto spin</button>
            </div>
            <p className={styles.saldo}>
                Saldo: {dinero || 0}
            </p>
            <div className={styles.botonSpin}>
                <button onClick={onSpin}>spin</button>
            </div>
        </div>
    )
}