// arrow: function funcion q almacena el componente
import styles from './LowBar.module.css'

export const Lowbar = ({dinero, onSpin, onStartAutoSpin, onStopAutoSpin, onOpenTienda}) => {
    return(
        //  contenedores
        <div className={styles.contenedor}>
            <div className={styles.botonesIzq}>
                <button className={styles.botonTienda} onClick={onOpenTienda}>Tienda</button>
            </div>
            <p className={styles.saldo}>
                Saldo: {dinero || 0}
            </p>
            <div className={styles.botonesDerecha}>
                <button className={styles.botonStop} onClick={onStopAutoSpin}>stop</button>
                <button className={styles.botonAutoSpin} onClick={onStartAutoSpin}>auto spin</button>
            </div>
        </div>
    )
}