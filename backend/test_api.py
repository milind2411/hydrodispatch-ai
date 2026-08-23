import sys
import pathlib

BASE_DIR = pathlib.Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def main():
    print('[1/3] Testing GET /health endpoint...')
    res = client.get('/health')
    assert res.status_code == 200, f'Health check failed: {res.text}'
    print('      Health OK:', res.json())

    print('[2/3] Testing POST /dispatch/run endpoint...')
    payload = {
        'peak_solar_kw': 600.0,
        'mean_wind_kw': 250.0,
        'cloud_cover': 0.15,
        'wind_variance': 0.2,
        'peak_price': 10.0,
        'offpeak_price': 3.5,
        're_lcoe': 2.4,
        'ely_type': 'PEM',
        'ely_capacity_kw': 600.0,
        'daily_h2_target_kg': 140.0,
        'storage_capacity_kg': 60.0
    }
    res = client.post('/dispatch/run', json=payload)
    assert res.status_code == 200, f'Dispatch run failed: {res.text}'
    data = res.json()

    assert 'metrics' in data, 'Missing metrics in response'
    assert 'optimized_schedule' in data, 'Missing optimized_schedule in response'
    assert len(data['optimized_schedule']) == 96, 'Schedule must contain 96 intervals'

    metrics = data['metrics']
    lcoh = metrics['optimized_lcoh_rs_kg']
    lcoh_red = metrics['lcoh_reduction_pct']
    savings = metrics['savings_pct']
    ramp_red = metrics['ramp_reduction_pct']
    h2_prod = metrics['optimized_h2_kg']
    audit_hash = metrics['audit_block_hash']

    print('\n' + '='*55)
    print('            API TEST SUMMARY')
    print('='*55)
    print(f' Response Status:       HTTP {res.status_code}')
    print(f' Optimized H2 Output:   {h2_prod} kg/day')
    print(f' Optimized LCOH:        Rs. {lcoh}/kg')
    print(f' LCOH Reduction:        {lcoh_red}%')
    print(f' OPEX Savings:          {savings}%')
    print(f' Ramp Stress Reduction: {ramp_red}%')
    print(f' Audit Block Hash:      {audit_hash}')
    print('='*55)

    print('[3/3] Testing POST /dispatch/export-csv endpoint...')
    csv_res = client.post('/dispatch/export-csv', json=payload)
    assert csv_res.status_code == 200, f'Export failed: {csv_res.text}'
    assert 'text/csv' in csv_res.headers.get('content-type', '')
    csv_lines = csv_res.text.strip().split('\n')
    assert len(csv_lines) == 97  # Header + 96 intervals
    print(f'      CSV Export OK ({len(csv_lines)} lines, {len(csv_res.text)} bytes)')

    print('='*55)
    print('STATUS: FASTAPI BACKEND VERIFIED SUCCESSFULLY!')

if __name__ == '__main__':
    main()
