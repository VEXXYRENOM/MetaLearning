from gradio_client import Client
client = Client("TencentARC/InstantMesh")
print(client.view_api(print_info=False, return_format="dict"))
