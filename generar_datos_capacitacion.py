
from pathlib import Path
import json
import numpy as np
import pandas as pd

SEED = 20260802
N_PRODUCTOS = 3000
N_SUCURSALES = 400
N_MOVIMIENTOS = 250000

BASE = Path(__file__).resolve().parent
DATA = BASE / "data"
MUESTRAS = BASE / "muestras"
DATA.mkdir(parents=True, exist_ok=True)
MUESTRAS.mkdir(parents=True, exist_ok=True)

rng = np.random.default_rng(SEED)

def generar_productos(n=3000):
    categorias = np.array([
        "MEDICAMENTOS", "CUIDADO PERSONAL", "BELLEZA", "DERMOCOSMETICA",
        "NUTRICION", "BEBES", "DISPOSITIVOS MEDICOS", "HIGIENE"
    ], dtype=object)
    prob_categorias = [0.32, 0.16, 0.12, 0.12, 0.10, 0.08, 0.05, 0.05]

    laboratorios = np.array([
        "LABORATORIO ANDES VIDA", "NOVA SALUD", "BIOQUIM FARMA",
        "FARMA SIERRA", "PACIFICO HEALTH", "VITALIS ECUADOR",
        "INNOVA CARE", "MEDILAB SUR", "DERMA NOVA", "NUTRILIFE",
        "BEBE SANO", "CLINIMED", "SALUD INTEGRAL", "QUIMICA CENTRAL",
        "PHARMA FUTURA", "VIDA ACTIVA", "BIENESTAR LABS", "NATURA MED"
    ], dtype=object)

    activos = {
        "MEDICAMENTOS": ["PARACETAMOL", "IBUPROFENO", "LORATADINA", "OMEPRAZOL",
                         "AMOXICILINA", "DICLOFENACO", "CETIRIZINA", "NAPROXENO"],
        "CUIDADO PERSONAL": ["SHAMPOO SUAVE", "JABON LIQUIDO", "DESODORANTE",
                             "ENJUAGUE BUCAL", "PASTA DENTAL", "GEL ANTIBACTERIAL"],
        "BELLEZA": ["CREMA HIDRATANTE", "SERUM FACIAL", "LIMPIADOR FACIAL",
                    "MASCARILLA", "PROTECTOR LABIAL", "AGUA MICELAR"],
        "DERMOCOSMETICA": ["CREMA REPARADORA", "PROTECTOR SOLAR", "GEL LIMPIADOR",
                           "SERUM ANTIOXIDANTE", "LOCION CORPORAL", "CREMA ANTIMANCHAS"],
        "NUTRICION": ["VITAMINA C", "MULTIVITAMINICO", "PROTEINA EN POLVO",
                      "CALCIO", "OMEGA 3", "BEBIDA NUTRICIONAL"],
        "BEBES": ["PANAL INFANTIL", "TOALLITAS HUMEDAS", "CREMA PARA BEBE",
                  "SHAMPOO INFANTIL", "FORMULA INFANTIL", "ACEITE PARA BEBE"],
        "DISPOSITIVOS MEDICOS": ["TERMOMETRO DIGITAL", "MASCARILLA QUIRURGICA",
                                 "VENDA ELASTICA", "JERINGA DESECHABLE",
                                 "GUANTES DE EXAMEN", "GASA ESTERIL"],
        "HIGIENE": ["ALCOHOL ANTISEPTICO", "JABON ANTIBACTERIAL", "TOALLA SANITARIA",
                    "PAPEL HIGIENICO", "ESPONJA DE BANO", "HILO DENTAL"]
    }

    presentaciones = [
        "TABLETAS 500 MG", "CAPSULAS 20 MG", "JARABE 120 ML", "CREMA 50 G",
        "GEL 100 ML", "LOCION 250 ML", "SPRAY 60 ML", "UNIDAD",
        "CAJA X 20", "FRASCO 30 ML", "SOBRES X 10", "PAQUETE X 12"
    ]

    categoria = rng.choice(categorias, size=n, p=prob_categorias)
    descripcion = np.array(
        [f"{rng.choice(activos[cat])} {rng.choice(presentaciones)}" for cat in categoria],
        dtype=object
    )

    idx_minusculas = rng.choice(n, size=int(n * 0.025), replace=False)
    descripcion[idx_minusculas] = np.char.lower(descripcion[idx_minusculas].astype(str))
    restantes = np.setdiff1d(np.arange(n), idx_minusculas)
    idx_espacios = rng.choice(restantes, size=int(n * 0.025), replace=False)
    descripcion[idx_espacios] = np.array(
        ["  " + str(x) + "  " for x in descripcion[idx_espacios]], dtype=object
    )

    laboratorio = rng.choice(laboratorios, size=n).astype(object)
    idx_null_lab = rng.choice(n, size=int(n * 0.03), replace=False)
    laboratorio[idx_null_lab] = None
    restantes = np.setdiff1d(np.arange(n), idx_null_lab)
    idx_vacio_lab = rng.choice(restantes, size=int(n * 0.02), replace=False)
    laboratorio[idx_vacio_lab] = ""
    restantes = np.setdiff1d(restantes, idx_vacio_lab)
    idx_espacio_lab = rng.choice(restantes, size=int(n * 0.01), replace=False)
    laboratorio[idx_espacio_lab] = "   "

    rangos_precio = {
        "MEDICAMENTOS": (1.5, 65.0), "CUIDADO PERSONAL": (1.0, 35.0),
        "BELLEZA": (3.0, 75.0), "DERMOCOSMETICA": (8.0, 120.0),
        "NUTRICION": (4.0, 95.0), "BEBES": (2.0, 70.0),
        "DISPOSITIVOS MEDICOS": (0.5, 85.0), "HIGIENE": (0.8, 25.0),
    }
    precio = np.round(
        np.array([rng.uniform(*rangos_precio[c]) for c in categoria], dtype=float), 2
    )
    idx_null_precio = rng.choice(n, size=int(n * 0.01), replace=False)
    precio[idx_null_precio] = np.nan

    stock = rng.gamma(shape=2.2, scale=38.0, size=n).round().astype(float)
    idx_cero = rng.choice(n, size=int(n * 0.10), replace=False)
    stock[idx_cero] = 0
    restantes = np.setdiff1d(np.arange(n), idx_cero)
    idx_null_stock = rng.choice(restantes, size=int(n * 0.02), replace=False)
    stock[idx_null_stock] = np.nan
    restantes = np.setdiff1d(restantes, idx_null_stock)
    idx_extremos = rng.choice(restantes, size=max(10, int(n * 0.005)), replace=False)
    stock[idx_extremos] = rng.integers(800, 2500, size=len(idx_extremos))

    estado = rng.choice(
        np.array(["ACTIVO", "INACTIVO", "DESCONTINUADO"], dtype=object),
        size=n, p=[0.90, 0.07, 0.03]
    )

    return pd.DataFrame({
        "codigo_producto": [f"{i:010d}" for i in range(1, n + 1)],
        "descripcion_producto": descripcion,
        "categoria": categoria,
        "laboratorio": laboratorio,
        "precio_unitario": precio,
        "stock_actual": pd.array(stock, dtype="Int64"),
        "estado_producto": estado,
    })

def generar_sucursales(n=400):
    ciudades_por_provincia = {
        "PICHINCHA": ["QUITO", "CAYAMBE", "SANGOLQUI"],
        "GUAYAS": ["GUAYAQUIL", "DURAN", "SAMBORONDON"],
        "AZUAY": ["CUENCA", "GUALACEO"],
        "MANABI": ["MANTA", "PORTOVIEJO", "CHONE"],
        "TUNGURAHUA": ["AMBATO", "BANOS"],
        "EL ORO": ["MACHALA", "PASAJE"],
        "LOJA": ["LOJA", "CATAMAYO"],
        "IMBABURA": ["IBARRA", "OTAVALO"],
        "SANTO DOMINGO": ["SANTO DOMINGO"],
        "COTOPAXI": ["LATACUNGA", "SALCEDO"],
        "CHIMBORAZO": ["RIOBAMBA"],
        "LOS RIOS": ["BABAHOYO", "QUEVEDO"],
        "ESMERALDAS": ["ESMERALDAS"],
        "SANTA ELENA": ["SALINAS", "LA LIBERTAD"],
        "CANAR": ["AZOGUES"],
        "PASTAZA": ["PUYO"],
        "NAPO": ["TENA"],
    }
    provincias = np.array(list(ciudades_por_provincia), dtype=object)
    pesos = np.array([0.24, 0.22, 0.08, 0.08, 0.06, 0.05, 0.04, 0.04,
                      0.035, 0.035, 0.03, 0.035, 0.02, 0.02, 0.015, 0.01, 0.01])
    pesos = pesos / pesos.sum()

    provincia = rng.choice(provincias, size=n, p=pesos)
    ciudad = np.array([rng.choice(ciudades_por_provincia[p]) for p in provincia], dtype=object)
    tipo = rng.choice(
        np.array(["FARMACIA", "AUTOSERVICIO", "CENTRO COMERCIAL", "BARRIO"], dtype=object),
        size=n, p=[0.48, 0.18, 0.16, 0.18]
    )
    estado = rng.choice(
        np.array(["ACTIVA", "INACTIVA"], dtype=object),
        size=n, p=[0.95, 0.05]
    )
    nombre = np.array(
        [f"PUNTO SALUD {c} {i:03d}" for i, c in enumerate(ciudad, start=1)],
        dtype=object
    )

    return pd.DataFrame({
        "codigo_sucursal": [f"{i:04d}" for i in range(1, n + 1)],
        "nombre_sucursal": nombre,
        "ciudad": ciudad,
        "provincia": provincia,
        "tipo_sucursal": tipo,
        "estado_sucursal": estado,
    })

def generar_movimientos(productos, sucursales, n=250000):
    n_base = n - 500

    productos_usados = productos.iloc[:2850].reset_index(drop=True)
    sucursales_usadas = sucursales.iloc[:380].reset_index(drop=True)

    inval_prod = np.array([f"99999{i:05d}" for i in range(1, 21)], dtype=object)
    inval_suc = np.array([f"9{i:03d}" for i in range(1, 11)], dtype=object)

    es_prod_invalido = rng.random(n_base) < 0.008
    prod_idx = rng.integers(0, len(productos_usados), size=n_base)
    codigo_producto = productos_usados["codigo_producto"].to_numpy(dtype=object)[prod_idx].copy()
    codigo_producto[es_prod_invalido] = rng.choice(inval_prod, size=es_prod_invalido.sum())

    es_suc_invalida = rng.random(n_base) < 0.005
    suc_idx = rng.integers(0, len(sucursales_usadas), size=n_base)
    codigo_sucursal = sucursales_usadas["codigo_sucursal"].to_numpy(dtype=object)[suc_idx].copy()
    codigo_sucursal[es_suc_invalida] = rng.choice(inval_suc, size=es_suc_invalida.sum())

    inicio = np.datetime64("2025-01-01T00:00:00")
    fin = np.datetime64("2026-08-01T00:00:00")
    segundos = int((fin - inicio) / np.timedelta64(1, "s"))
    fecha = inicio + rng.integers(0, segundos, size=n_base).astype("timedelta64[s]")

    tipos = np.array(["VENTA", "COMPRA", "TRANSFERENCIA", "DEVOLUCION", "AJUSTE"], dtype=object)
    tipo = rng.choice(tipos, size=n_base, p=[0.58, 0.15, 0.15, 0.07, 0.05])

    cantidad = np.zeros(n_base, dtype=int)
    mask = tipo == "VENTA"
    cantidad[mask] = rng.integers(1, 11, size=mask.sum())
    mask = tipo == "COMPRA"
    cantidad[mask] = rng.integers(5, 101, size=mask.sum())
    mask = tipo == "TRANSFERENCIA"
    cantidad[mask] = rng.integers(1, 31, size=mask.sum())
    mask = tipo == "DEVOLUCION"
    cantidad[mask] = -rng.integers(1, 11, size=mask.sum())
    mask = tipo == "AJUSTE"
    cantidad[mask] = rng.integers(-20, 21, size=mask.sum())
    cantidad[(tipo == "AJUSTE") & (cantidad == 0)] = 1

    idx_extremos = rng.choice(n_base, size=max(100, int(n_base * 0.001)), replace=False)
    cantidad[idx_extremos] *= rng.integers(10, 31, size=len(idx_extremos))

    precios = productos_usados["precio_unitario"].astype(float).to_numpy()
    precio_mediano = float(np.nanmedian(precios))
    precio_base = precios[prod_idx]
    precio_base = np.where(np.isnan(precio_base), precio_mediano, precio_base)
    precio_base[es_prod_invalido] = rng.uniform(2.0, 80.0, size=es_prod_invalido.sum())

    factor = np.ones(n_base)
    factor[tipo == "COMPRA"] = 0.72
    factor[tipo == "TRANSFERENCIA"] = 0.95
    factor[tipo == "DEVOLUCION"] = 1.00
    factor[tipo == "AJUSTE"] = 0.90
    ruido = rng.uniform(0.97, 1.03, size=n_base)
    valor = np.round(cantidad * precio_base * factor * ruido, 2)

    estado = rng.choice(
        np.array(["VALIDO", "PENDIENTE", "ANULADO"], dtype=object),
        size=n_base, p=[0.92, 0.04, 0.04]
    )

    observacion = rng.choice(
        np.array([
            None, "MOVIMIENTO GENERADO AUTOMATICAMENTE", "REVISION MANUAL",
            "AJUSTE POR INVENTARIO", "DIFERENCIA EN CONTEO", "", "   "
        ], dtype=object),
        size=n_base,
        p=[0.72, 0.08, 0.06, 0.06, 0.04, 0.025, 0.015]
    )

    base = pd.DataFrame({
        "id_movimiento": np.arange(1, n_base + 1, dtype=np.int64),
        "fecha_movimiento": pd.to_datetime(fecha),
        "codigo_producto": codigo_producto,
        "codigo_sucursal": codigo_sucursal,
        "tipo_movimiento": tipo,
        "cantidad": cantidad,
        "valor": valor,
        "estado_movimiento": estado,
        "observacion": observacion,
    })

    idx_dup = rng.choice(n_base, size=500, replace=False)
    duplicados = base.iloc[idx_dup].copy()
    duplicados["id_movimiento"] = np.arange(n_base + 1, n + 1, dtype=np.int64)

    return pd.concat([base, duplicados], ignore_index=True)

def main():
    productos = generar_productos(N_PRODUCTOS)
    sucursales = generar_sucursales(N_SUCURSALES)
    movimientos = generar_movimientos(productos, sucursales, N_MOVIMIENTOS)

    productos.to_csv(DATA / "productos.csv", index=False, encoding="utf-8", na_rep="__NULL__")
    sucursales.to_csv(DATA / "sucursales.csv", index=False, encoding="utf-8", na_rep="__NULL__")
    movimientos.to_csv(
        DATA / "movimientos.csv", index=False, encoding="utf-8",
        date_format="%Y-%m-%d %H:%M:%S", na_rep="__NULL__"
    )

    productos.head(100).to_csv(
        MUESTRAS / "productos_muestra.csv", index=False, encoding="utf-8-sig", na_rep="__NULL__"
    )
    sucursales.head(100).to_csv(
        MUESTRAS / "sucursales_muestra.csv", index=False, encoding="utf-8-sig", na_rep="__NULL__"
    )
    movimientos.head(200).to_csv(
        MUESTRAS / "movimientos_muestra.csv", index=False, encoding="utf-8-sig",
        date_format="%Y-%m-%d %H:%M:%S", na_rep="__NULL__"
    )

    cod_prod = set(productos["codigo_producto"])
    cod_suc = set(sucursales["codigo_sucursal"])
    usados_prod = set(
        movimientos.loc[movimientos["codigo_producto"].isin(cod_prod), "codigo_producto"]
    )
    usados_suc = set(
        movimientos.loc[movimientos["codigo_sucursal"].isin(cod_suc), "codigo_sucursal"]
    )
    negocio = [c for c in movimientos.columns if c != "id_movimiento"]

    resumen = {
        "semilla": SEED,
        "registros": {
            "productos": int(len(productos)),
            "sucursales": int(len(sucursales)),
            "movimientos": int(len(movimientos)),
        },
        "calidad_controlada": {
            "productos_laboratorio_null": int(productos["laboratorio"].isna().sum()),
            "productos_laboratorio_vacio_o_espacios": int(
                productos["laboratorio"].fillna("").astype(str).str.strip().eq("").sum()
                - productos["laboratorio"].isna().sum()
            ),
            "productos_precio_null": int(productos["precio_unitario"].isna().sum()),
            "productos_stock_null": int(productos["stock_actual"].isna().sum()),
            "productos_stock_cero": int(productos["stock_actual"].eq(0).sum()),
            "movimientos_sin_producto": int((~movimientos["codigo_producto"].isin(cod_prod)).sum()),
            "movimientos_sin_sucursal": int((~movimientos["codigo_sucursal"].isin(cod_suc)).sum()),
            "productos_sin_movimientos": int(len(cod_prod - usados_prod)),
            "sucursales_sin_movimientos": int(len(cod_suc - usados_suc)),
            "filas_en_duplicados_de_negocio": int(
                movimientos.duplicated(negocio, keep=False).sum()
            ),
            "ids_movimiento_duplicados": int(
                movimientos["id_movimiento"].duplicated().sum()
            ),
        },
        "periodo_movimientos": {
            "desde": str(movimientos["fecha_movimiento"].min()),
            "hasta": str(movimientos["fecha_movimiento"].max()),
        },
    }

    (BASE / "resumen_generacion.json").write_text(
        json.dumps(resumen, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(resumen, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
