from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class MetricKey(str, Enum):
    TEMP = "temp_c"
    HUMIDITY = "humidity_pct"
    VOLTAGE = "voltage_v"
    CURRENT = "current_a"
    POWER = "power_w"


@dataclass(frozen=True)
class MetricDefinition:
    key: MetricKey
    label: str
    unit: str


METRIC_DEFINITIONS: dict[MetricKey, MetricDefinition] = {
    MetricKey.TEMP: MetricDefinition(MetricKey.TEMP, "Temperature", "°C"),
    MetricKey.HUMIDITY: MetricDefinition(MetricKey.HUMIDITY, "Humidity", "%"),
    MetricKey.VOLTAGE: MetricDefinition(MetricKey.VOLTAGE, "Voltage", "V"),
    MetricKey.CURRENT: MetricDefinition(MetricKey.CURRENT, "Current", "A"),
    MetricKey.POWER: MetricDefinition(MetricKey.POWER, "Power", "W"),
}

TELEMETRY_BUCKET = "iot_telemetry"
TELEMETRY_MEASUREMENT = "telemetry"
TELEMETRY_FIELD_VALUE = "value"
TELEMETRY_TAG_TENANT = "tenant_id"
TELEMETRY_TAG_DEVICE = "device_id"
TELEMETRY_TAG_METRIC = "metric"


def metric_keys() -> list[str]:
    return [definition.key.value for definition in METRIC_DEFINITIONS.values()]